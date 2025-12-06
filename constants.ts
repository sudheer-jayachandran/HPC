import { StudentData, MonthKey } from './types';

export const MONTHS: MonthKey[] = ['APR', 'MAY', 'JUNE', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'];

export const INITIAL_DATA: StudentData = {
  schoolName: '',
  village: '',
  brc: '',
  crc: '',
  state: '',
  pinCode: '',
  udiseCode: '',
  teacherCode: '',
  apaarId: '',
  studentName: '',
  rollNo: '',
  registrationNo: '',
  grade: '',
  section: '',
  dob: '',
  address: '',
  phone: '',
  photoUrl: '',
  motherName: '',
  motherEducation: '',
  motherOccupation: '',
  fatherName: '',
  fatherEducation: '',
  fatherOccupation: '',
  siblingsCount: '',
  siblingsAge: '',
  motherTongue: '',
  mediumOfInstruction: '',
  isRural: null,
  illnessCount: '',
  attendance: MONTHS.reduce((acc, month) => {
    acc[month] = { workingDays: '', daysPresent: '', percentage: '', reason: '' };
    return acc;
  }, {} as Record<MonthKey, any>),
  interests: {
    reading: false,
    music: false,
    sports: false,
    creativeWriting: false,
    gardening: false,
    yoga: false,
    art: false,
    craft: false,
    cooking: false,
    chores: false,
    other: false,
    otherSpecify: '',
  },
};
