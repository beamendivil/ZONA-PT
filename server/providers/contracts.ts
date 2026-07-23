export interface CalendarProvider {
  createEvent(input: { appointmentId: string; startsAt: string; endsAt: string; format: 'in-person' | 'virtual' }): Promise<{ externalEventId: string }>;
  cancelEvent(externalEventId: string): Promise<void>;
}

export interface NotificationProvider {
  send(input: { channel: 'email' | 'sms'; destination: string; templateKey: 'appointment-reminder-v1'; appointmentStartsAt: string }): Promise<{ providerMessageId: string }>;
}

// Implementations must be clinic-approved and BAA-covered. Reminder templates
// intentionally contain date/time and clinic contact information only—no
// diagnosis, treatment, exercise, pain, or intake details.
