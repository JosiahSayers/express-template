import { DateHelper } from './date-helper.service';

describe('DateHelper Service', () => {
    describe('isFutureDate', () => {
        it('returns true when the passed in date is in the future', () => {
            const futureDate = new Date(new Date().getTime() + 5000);
            expect(DateHelper.isFutureDate(futureDate)).toBe(true);
        });

        it('returns false when the passed in date is in the past', () => {
            const pastDate = new Date(new Date().getTime() - 5000);
            expect(DateHelper.isFutureDate(pastDate)).toBe(false);
        });

        it('returns false when the passed in date is the current date', () => {
            expect(DateHelper.isFutureDate(new Date())).toBe(false);
        });
    });
});
