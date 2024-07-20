declare module 'jcal-zmanim' {
  export class jDate {
    static now(): jDate;
    toString(): string;
    getSunriseSunset(location: any): { sunset: Date };
    addDays(days: number): jDate;
  }

  export function findLocation(name: string): any;

  export class Utils {
    static getTimeString(date: Date): string;
    static getParsha(date: jDate): string;
    static getCandleLighting(date: jDate, location: any): Date;
  }
}
