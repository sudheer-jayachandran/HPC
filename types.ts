export interface AttendanceData {
  workingDays: string;
  daysPresent: string;
  percentage: string;
  reason: string;
}

export type MonthKey = 'APR' | 'MAY' | 'JUNE' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC' | 'JAN' | 'FEB' | 'MAR';

export interface StudentData {
  // School Details
  schoolName: string;
  village: string;
  brc: string;
  crc: string;
  state: string;
  pinCode: string; // 6 chars
  udiseCode: string; // 11 chars
  teacherCode: string;
  apaarId: string;

  // Student General Info
  studentName: string;
  rollNo: string;
  registrationNo: string;
  grade: 'BV1' | 'BV2' | 'BV3' | 'Grade 1' | 'Grade 2' | '';
  section: string;
  dob: string;
  address: string;
  phone: string;
  photoUrl: string; // For future use, currently placeholder

  // Family Info
  motherName: string;
  motherEducation: string;
  motherOccupation: string;
  fatherName: string;
  fatherEducation: string;
  fatherOccupation: string;
  siblingsCount: string;
  siblingsAge: string;
  motherTongue: string;
  mediumOfInstruction: string;
  isRural: boolean | null; // true = Rural, false = Urban
  illnessCount: string;

  // Attendance
  attendance: Record<MonthKey, AttendanceData>;

  // Interests (Checkboxes)
  interests: {
    reading: boolean;
    music: boolean;
    sports: boolean;
    creativeWriting: boolean;
    gardening: boolean;
    yoga: boolean;
    art: boolean;
    craft: boolean;
    cooking: boolean;
    chores: boolean;
    other: boolean;
    otherSpecify: string;
  };
}
