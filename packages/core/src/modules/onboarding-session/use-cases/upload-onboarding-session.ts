import dayjs from 'dayjs';

import { id } from '@colorstack/utils';

import { job } from '@/infrastructure/bull/use-cases/job';
import { db } from '@/infrastructure/database';

type UploadOnboardingSessionInput = {
  attendees: string[];
  date: string;
};

export async function uploadOnboardingSession(
  input: UploadOnboardingSessionInput
) {
  const onboardingSessionId = id();

  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto('onboardingSessions')
      .values({
        date: input.date,
        id: onboardingSessionId,
      })
      .execute();

    await Promise.all(
      input.attendees.map(async (studentId) => {
        await trx
          .updateTable('students')
          .set({ onboardedAt: dayjs(input.date).hour(12).toDate() })
          .where('id', '=', studentId)
          .where('onboardedAt', 'is', null)
          .execute();

        await trx
          .insertInto('onboardingSessionAttendees')
          .values({
            id: id(),
            sessionId: onboardingSessionId,
            studentId,
          })
          .execute();
      })
    );
  });

  input.attendees.forEach((studentId) => {
    job('onboarding_session.attended', {
      onboardingSessionId,
      studentId,
    });
  });
}
