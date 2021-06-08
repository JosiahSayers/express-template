export class DateHelper {
    static isFutureDate(date: Date): boolean {
        return date.getTime() > new Date().getTime();
    }
}
