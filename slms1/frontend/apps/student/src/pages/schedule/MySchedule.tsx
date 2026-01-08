import { Card } from '@slms/ui';

const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 - 19:00

export function MySchedule() {
  return (
    <div className="my-schedule">
      <div className="page-header">
        <h2>Mein Stundenplan</h2>
      </div>

      <Card>
        <div className="schedule-grid">
          <div className="schedule-header">
            <div className="time-column"></div>
            {days.map(day => (
              <div key={day} className="day-column">{day}</div>
            ))}
          </div>
          <div className="schedule-body">
            {hours.map(hour => (
              <div key={hour} className="schedule-row">
                <div className="time-column">{hour}:00</div>
                {days.map(day => (
                  <div key={`${day}-${hour}`} className="day-column slot">
                    {/* TODO: Render events */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <p className="empty-message">Keine Termine im Stundenplan.</p>
      </Card>
    </div>
  );
}
