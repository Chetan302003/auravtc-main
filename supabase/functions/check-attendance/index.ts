import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TruckersmpPlayer {
  id: number;
  name: string;
  online: boolean;
  online_details?: {
    server_id: number;
    server_name: string;
  };
}

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  source: string;
  message: string;
  data?: Record<string, unknown>;
  run_id?: string;
  event_id?: string;
  member_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize backend client (service role)
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Generate a unique run ID for this execution
  const runId = crypto.randomUUID();

  const log = async (entry: LogEntry) => {
    const logData = {
      level: entry.level,
      source: entry.source || 'check-attendance',
      message: entry.message,
      data: entry.data || null,
      run_id: entry.run_id || runId,
      event_id: entry.event_id || null,
      member_id: entry.member_id || null,
    };

    // console logs (edge logs)
    console.log(`[${logData.level.toUpperCase()}] ${logData.source}: ${logData.message}`, logData.data ?? '');

    // DB logs (admin UI)
    try {
      await supabase.from('system_logs').insert(logData);
    } catch (err) {
      console.error('Failed to insert log into system_logs:', err);
    }
  };

  try {
    const body = await req.json().catch(() => ({} as any));
    const eventId: string | undefined = body?.eventId;
    const mode: 'attendance' | 'status' = body?.mode === 'status' ? 'status' : 'attendance';

    // Check if attendance system is enabled (from vtc_settings) FIRST before logging
    const { data: attendanceSetting } = await supabase
      .from('vtc_settings')
      .select('setting_value')
      .eq('setting_key', 'attendance_enabled')
      .maybeSingle();

    // Explicitly check if the setting value is 'true' (must be enabled, not just "not false")
    const isAttendanceEnabled = attendanceSetting?.setting_value === 'true';

    if (!isAttendanceEnabled) {
      // Only log briefly when disabled - no DB log to reduce noise
      console.log('[INFO] check-attendance: System disabled, skipping');
      return new Response(
        JSON.stringify({ success: true, message: 'Attendance system is disabled', skipped: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await log({ level: 'info', source: 'check-attendance', message: 'Request received', data: { runId, mode, eventId: eventId ?? null } });

    if (mode === 'attendance' && !eventId) {
      await log({ level: 'error', source: 'check-attendance', message: 'Event ID is required for attendance mode' });
      throw new Error('Event ID is required');
    }

    // Fetch event only in attendance mode
    let event: any = null;
    if (mode === 'attendance') {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError || !eventData) {
        await log({ level: 'error', source: 'check-attendance', message: 'Event not found', data: { eventId, error: eventError?.message }, event_id: eventId });
        throw new Error('Event not found');
      }

      event = eventData;

      await log({
        level: 'info',
        source: 'check-attendance',
        message: `Event loaded: ${event.title}`,
        data: { eventId, targetServerId: event.target_server_id, targetServerName: event.target_server_name },
        event_id: eventId,
      });
    }

    // Fetch active members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true);

    if (membersError) {
      await log({ level: 'error', source: 'check-attendance', message: 'Failed to fetch members', data: { error: membersError.message }, event_id: eventId });
      throw new Error('Failed to fetch members');
    }

    const memberCount = members?.length || 0;
    await log({ level: 'info', source: 'check-attendance', message: `Members to check: ${memberCount}`, data: { memberCount }, event_id: eventId });

    if (memberCount === 0) {
      return new Response(
        JSON.stringify({ success: true, mode, runId, message: 'No active members found', present: 0, absent: 0, online: 0, offline: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    let present = 0;
    let absent = 0;
    let online = 0;
    let offline = 0;

    for (const member of members || []) {
      try {
        const playerUrl = `https://api.truckersmp.com/v2/player/${member.tmp_id}`;

        await log({
          level: 'info',
          source: 'check-attendance',
          message: `Fetching player`,
          data: { username: member.username, tmpId: member.tmp_id, url: playerUrl },
          event_id: eventId,
          member_id: member.id,
        });

        const playerResponse = await fetch(playerUrl);

        if (!playerResponse.ok) {
          await log({
            level: 'warn',
            source: 'check-attendance',
            message: `TruckersMP API non-OK`,
            data: { status: playerResponse.status, statusText: playerResponse.statusText },
            event_id: eventId,
            member_id: member.id,
          });
          continue;
        }

        const playerData = await playerResponse.json();
        const player: TruckersmpPlayer = playerData.response;

        const isOnline = !!player?.online;
        const serverId = player?.online_details?.server_id;
        const serverName = player?.online_details?.server_name;

        await log({
          level: 'info',
          source: 'check-attendance',
          message: `Player status`,
          data: { username: member.username, isOnline, serverId: serverId ?? null, serverName: serverName ?? null },
          event_id: eventId,
          member_id: member.id,
        });

        if (isOnline) online++; else offline++;

        // Always refresh last seen fields based on real-time status
        if (isOnline) {
          const { error: updateError } = await supabase
            .from('members')
            .update({
              last_seen_online: now,
              last_seen_server: serverName || null,
              updated_at: now,
            })
            .eq('id', member.id);

          if (updateError) {
            await log({
              level: 'warn',
              source: 'check-attendance',
              message: 'Failed to update member last seen',
              data: { error: updateError.message },
              event_id: eventId,
              member_id: member.id,
            });
          }
        } else {
          // Mark as offline in UI by clearing last_seen_server
          const { error: updateError } = await supabase
            .from('members')
            .update({
              last_seen_server: null,
              updated_at: now,
            })
            .eq('id', member.id);

          if (updateError) {
            await log({
              level: 'warn',
              source: 'check-attendance',
              message: 'Failed to clear member last_seen_server',
              data: { error: updateError.message },
              event_id: eventId,
              member_id: member.id,
            });
          }
        }

        // Attendance mode: upsert attendance + convoy increment if present
        // ATTENDANCE WINDOW: Once marked present, never overwrite to absent
        if (mode === 'attendance' && event) {
          const isCurrentlyPresent = isOnline && (!event.target_server_id || serverId === event.target_server_id);

          // Check if already marked present (attendance window lock)
          const { data: existingAttendance } = await supabase
            .from('attendance')
            .select('is_present')
            .eq('event_id', eventId)
            .eq('member_id', member.id)
            .maybeSingle();

          const wasAlreadyPresent = existingAttendance?.is_present === true;
          const finalIsPresent = wasAlreadyPresent || isCurrentlyPresent;

          // Only update if newly present or no record exists
          if (!wasAlreadyPresent) {
            const { error: attendanceError } = await supabase
              .from('attendance')
              .upsert(
                {
                  event_id: eventId,
                  member_id: member.id,
                  tmp_id: member.tmp_id,
                  is_present: finalIsPresent,
                  checked_at: now,
                  server_id_at_check: serverId || null,
                  server_name_at_check: serverName || null,
                },
                { onConflict: 'event_id,member_id' }
              );

            if (attendanceError) {
              await log({ level: 'error', source: 'check-attendance', message: 'Attendance upsert failed', data: { error: attendanceError.message }, event_id: eventId, member_id: member.id });
            } else if (isCurrentlyPresent) {
              // Increment convoy count only when first detected present
              const { error: convoyError } = await supabase
                .from('members')
                .update({ total_convoys: (member.total_convoys || 0) + 1, updated_at: now })
                .eq('id', member.id);

              if (convoyError) {
                await log({ level: 'warn', source: 'check-attendance', message: 'Failed to increment convoy count', data: { error: convoyError.message }, event_id: eventId, member_id: member.id });
              }
            }
          }

          if (finalIsPresent) {
            present++;
            const reason = wasAlreadyPresent ? 'locked from previous check' : 'detected now';
            await log({ level: 'info', source: 'check-attendance', message: `${member.username} PRESENT (${reason})`, data: { serverId: serverId ?? null, serverName: serverName ?? null, wasAlreadyPresent }, event_id: eventId, member_id: member.id });
          } else {
            absent++;
            await log({ level: 'info', source: 'check-attendance', message: `${member.username} ABSENT`, data: { isOnline, serverId: serverId ?? null, targetServerId: event.target_server_id ?? null }, event_id: eventId, member_id: member.id });
          }
        }

        // small delay
        await new Promise((resolve) => setTimeout(resolve, 150));
      } catch (memberError) {
        const errorMessage = memberError instanceof Error ? memberError.message : 'Unknown error';
        await log({ level: 'error', source: 'check-attendance', message: 'Member check failed', data: { username: member.username, error: errorMessage }, event_id: eventId, member_id: member.id });
      }
    }

    if (mode === 'attendance' && eventId) {
      const { error: eventUpdateError } = await supabase
        .from('events')
        .update({ attendance_checked_at: now, updated_at: now })
        .eq('id', eventId);

      if (eventUpdateError) {
        await log({ level: 'warn', source: 'check-attendance', message: 'Failed to update event attendance_checked_at', data: { error: eventUpdateError.message }, event_id: eventId });
      }
    }

    const totalAttendance = present + absent;
    const attendancePercent = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

    await log({
      level: 'info',
      source: 'check-attendance',
      message: 'Run complete',
      data: { mode, online, offline, present, absent, attendancePercent },
      event_id: eventId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        runId,
        online,
        offline,
        present,
        absent,
        total: mode === 'attendance' ? totalAttendance : online + offline,
        attendancePercent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, runId }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
