
export interface AttendanceData {
  workingDays: string;
  daysPresent: string;
  percentage: string;
}

export type MonthKey = 'APR' | 'MAY' | 'JUNE' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC' | 'JAN' | 'FEB' | 'MAR';

export type RubricLevel = 'Stream' | 'Mountain' | 'Sky' | '';

export interface StudentData {
  // School Details
  schoolName: string;
  village: string;
  brc: string;
  crc: string;
  state: string;
  pinCode: string;
  udiseCode: string;
  teacherCode: string;
  apaarId: string;

  // Student General Info
  studentName: string;
  rollNo: string;
  registrationNo: string;
  grade: 'BV1' | 'BV2' | 'BV3' | 'Grade 1' | 'Grade 2' | '';
  section: string;
  dob: string;
  age: string;
  address: string;
  phone: string;
  photoUrl: string;
  
  // Page 2 Specifics
  mePhotoUrl: string;
  familyPhotoUrl: string;
  ambition: string;
  friends: string;
  favColour: string;
  favFood: string;
  favAnimal: string;
  favFlower: string;
  favSport: string;
  favSubject: string;

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
  isRural: boolean | null;
  illnessCount: string;

  // Attendance
  attendance: Record<MonthKey, AttendanceData>;
  attendanceReason: string;

  // Interests
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

  // Page 3 - Part B (Domain 1)
  partB: {
    domain1: {
      curricularGoals: string;
      competencies: string;
      activity: string;
      assessmentQuestions: string;
      rubric: {
        awareness: RubricLevel;
        sensitivity: RubricLevel;
        creativity: RubricLevel;
      };
    };
  };

  // Page 4 - Feedback & Observations
  page4: {
    teacherFeedback: {
      observationalNotes: string;
      proficiencyLevel: RubricLevel;
    };
    selfAssessment: {
      liked: 'yes' | 'no' | 'dnk' | '';
      easy: 'yes' | 'no' | 'dnk' | '';
      needs: string[];
    };
    peerAssessment: {
      liked: 'yes' | 'no' | 'dnk' | '';
      easy: 'yes' | 'no' | 'dnk' | '';
      needs: string[];
    };
    parentObservation: {
      resources: string[];
      otherResource: string;
      remarks: string;
    };
  };
}
