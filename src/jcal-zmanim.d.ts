declare module 'jcal-zmanim' {
  export class jDate {
    static now(): jDate;
    toString(): string;
    getSunriseSunset(location: any): { sunset: Date };
  }

  export function findLocation(name: string): any;

  export class Utils {
    static getTimeString(date: Date): string;
  }
}
