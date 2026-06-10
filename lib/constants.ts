export const FACULTIES = [
    // these are actual UNILAK faculties
  'Faculty of CIS',
  'Faculty of ESM',
  'Faculty of Law',
  'Faculty of Education',
  'Faculty of Environmental studies',
];

export const DEPARTMENTS: Record<string, string[]> = {
    //these are actual UNILAK departments
  'Faculty of CIS': ['SE', 'IT Net','IT Mult', 'ISM'],
  'Faculty of ESM': ['Finance', 'Marketing', 'HRM', 'Accounting', 'Economics', 'Cooperatives'],
  'Faculty of Law': ['Law'],
  'Faculty of Education': [], //I don't know the departments in the faculty of education, so I left it blank
  'Faculty of Environmental studies': [], //I don't know the departments in the faculty of environmental studies, so I left it blank
};

export const PROGRAMS = ['Day', 'Evening', 'Weekend'];

export const INTAKE_MONTHS = ['Jan', 'May', 'Sep'];

export const YEARS_OF_STUDY = ['1', '2', '3'];

/**
 * Generates relevant years for selection (Current + Next)
 * Format: ["2025", "2026"]
 */
export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear.toString(), (currentYear + 1).toString()];
};

export const getIntakeOptions = () => {
  const years = getYearOptions();
  return years.flatMap(year => INTAKE_MONTHS.map(month => `${month}${year}`));
};