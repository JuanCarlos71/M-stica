import { CelestialEvent } from '../types';

export function generateICS(events: CelestialEvent[]): string {
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Celestial Alchemy//Calendario Astrologico//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Eventos Celestiales y Lunares'
  ];

  events.forEach(evt => {
    const cleanDate = evt.date.replace(/-/g, '');
    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${evt.id}-${Date.now()}@celestialalchemy.app`);
    icsContent.push(`DTSTAMP:${cleanDate}T000000Z`);
    icsContent.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    icsContent.push(`SUMMARY:✨ ${evt.title}`);
    icsContent.push(`DESCRIPTION:${evt.description} | Influencia: ${evt.influence}`);
    icsContent.push('TRANSP:TRANSPARENT');
    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadCalendarICS(events: CelestialEvent[]) {
  const content = generateICS(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', 'Celestial_Alchemy_Eventos_Astronomicos.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openGoogleCalendarEvent(event: CelestialEvent) {
  const startDate = event.date.replace(/-/g, '');
  const title = encodeURIComponent(`✨ ${event.title}`);
  const details = encodeURIComponent(`${event.description}\n\nInfluencia Cósmica: ${event.influence}\nSincronizado desde Celestial Alchemy.`);
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&details=${details}`;
  window.open(url, '_blank');
}
