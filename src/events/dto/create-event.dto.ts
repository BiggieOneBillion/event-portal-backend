import { IsNumber, IsString, ArrayNotEmpty, IsArray } from 'class-validator';

// export class CreateEventDto {
//   @IsString()
//   readonly name: string;
//   @IsString()
//   readonly location: string;
//   @IsString()
//   readonly type:
//     | 'Wedding'
//     | 'Kids Show'
//     | 'Church Events'
//     | 'Adult Show'
//     | 'All Ages'
//     | 'Educational'
//     | 'Conference'
//     | 'Entertainment';
//   @IsNumber()
//   readonly noOfAttendees: number;
//   @IsString()
//   readonly date: string;
//   @IsArray()
//   @ArrayNotEmpty()
//   @IsString({ each: true })
//   readonly startTimes: string[];
//   @IsArray()
//   @ArrayNotEmpty()
//   @IsString({ each: true })
//   readonly endTimes: string[];
//   // @IsString()
//   readonly eventImg: File;
//   @IsString()
//   readonly title: string;
//   @IsString()
//   readonly description: string;
//   // @IsString()
//   // readonly registrationUrl: string;
//   @IsString()
//   readonly registrationStartDate: string;
//   @IsString()
//   readonly registrationEndDate: string;
// }

export class CreateEventDto {
  @IsString()
  readonly name: string;
  @IsString()
  readonly location: string;
  @IsString()
  readonly type:
    | 'Wedding'
    | 'Kids Show'
    | 'Church Events'
    | 'Adult Show'
    | 'All Ages'
    | 'Educational'
    | 'Conference'
    | 'Entertainment';
  readonly noOfAttendees: number;
  @IsString()
  readonly date: string;
  @IsArray()
  @IsString({ each: true })
  readonly startTimes: string[];
  @IsArray()
  @IsString({ each: true })
  readonly endTimes: string[];
  @IsString()
  readonly eventImg: string;
  @IsString()
  readonly title: string;
  @IsString()
  readonly description: string;
  @IsString()
  readonly registrationStartDate: string;
  @IsString()
  readonly registrationEndDate: string;
  @IsString()
  readonly authType: 'barcode' | 'pincode';
}
