export interface AppointmentSlot {
  id: string;
  startsAt: string;
  formats: Array<'in-person' | 'virtual'>;
  clinician: string;
}

function buildAvailability(): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const date = new Date();
  date.setHours(9, 0, 0, 0);
  let addedDays = 0;

  while (addedDays < 5) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    for (const hour of [9, 11, 14]) {
      const startsAt = new Date(date);
      startsAt.setHours(hour, hour === 11 ? 30 : 0);
      slots.push({
        id: `slot-${startsAt.toISOString()}`,
        startsAt: startsAt.toISOString(),
        formats: hour === 14 ? ['virtual'] : ['in-person', 'virtual'],
        clinician: hour === 11 ? 'Jordan Lee, PT' : 'Dr. Zona, PT',
      });
    }
    addedDays += 1;
  }
  return slots;
}

export const SchedulingService = {
  getAvailableSlots(): AppointmentSlot[] {
    return buildAvailability();
  },
};
