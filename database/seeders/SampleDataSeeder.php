<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Course;
use App\Models\AcademicYear;
use App\Models\StudentProfile;
use App\Models\FacultyProfile;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create Academic Years
        $academicYears = [
            ['school_year' => '2023-2024'],
            ['school_year' => '2024-2025'],
            ['school_year' => '2025-2026'],
        ];

        foreach ($academicYears as $year) {
            AcademicYear::firstOrCreate(['school_year' => $year['school_year']], $year);
        }

        // Create Departments
        $departments = [
            ['department_name' => 'Computer Science', 'department_head' => 'Dr. John Smith'],
            ['department_name' => 'Business Administration', 'department_head' => 'Dr. Jane Doe'],
            ['department_name' => 'Nursing', 'department_head' => 'Dr. Michael Johnson'],
            ['department_name' => 'Engineering', 'department_head' => 'Dr. Sarah Williams'],
            ['department_name' => 'Education', 'department_head' => 'Dr. Robert Brown'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['department_name' => $dept['department_name']], $dept);
        }

        // Create Courses
        $courses = [
            ['course_name' => 'Bachelor of Science in Computer Science', 'department_id' => 1],
            ['course_name' => 'Bachelor of Science in Information Technology', 'department_id' => 1],
            ['course_name' => 'Bachelor of Science in Business Administration', 'department_id' => 2],
            ['course_name' => 'Bachelor of Science in Nursing', 'department_id' => 3],
            ['course_name' => 'Bachelor of Science in Civil Engineering', 'department_id' => 4],
            ['course_name' => 'Bachelor of Elementary Education', 'department_id' => 5],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(['course_name' => $course['course_name']], $course);
        }

        // Create Faculty Profiles
        $faculties = [
            [
                'f_name' => 'John',
                'l_name' => 'Smith',
                'email_address' => 'john.smith@university.edu',
                'phone_number' => '09123456789',
                'department_id' => 1,
                'position' => 'Professor',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Jane',
                'l_name' => 'Doe',
                'email_address' => 'jane.doe@university.edu',
                'phone_number' => '09123456790',
                'department_id' => 2,
                'position' => 'Associate Professor',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Michael',
                'l_name' => 'Johnson',
                'email_address' => 'michael.johnson@university.edu',
                'phone_number' => '09123456791',
                'department_id' => 3,
                'position' => 'Assistant Professor',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Sarah',
                'l_name' => 'Williams',
                'email_address' => 'sarah.williams@university.edu',
                'phone_number' => '09123456792',
                'department_id' => 4,
                'position' => 'Professor',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Robert',
                'l_name' => 'Brown',
                'email_address' => 'robert.brown@university.edu',
                'phone_number' => '09123456793',
                'department_id' => 5,
                'position' => 'Instructor',
                'status' => 'Active'
            ],
        ];

        foreach ($faculties as $faculty) {
            FacultyProfile::firstOrCreate(['email_address' => $faculty['email_address']], $faculty);
        }

        // Create Student Profiles
        $students = [
            [
                'f_name' => 'Alice',
                'l_name' => 'Johnson',
                'email_address' => 'alice.johnson@student.edu',
                'phone_number' => '09111111111',
                'date_of_birth' => '2000-01-15',
                'sex' => 'Female',
                'department_id' => 1,
                'course_id' => 1,
                'academic_year_id' => 1,
                'year_level' => 'Senior',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Bob',
                'l_name' => 'Smith',
                'email_address' => 'bob.smith@student.edu',
                'phone_number' => '09111111112',
                'date_of_birth' => '2001-03-22',
                'sex' => 'Male',
                'department_id' => 1,
                'course_id' => 2,
                'academic_year_id' => 1,
                'year_level' => 'Junior',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Carol',
                'l_name' => 'Davis',
                'email_address' => 'carol.davis@student.edu',
                'phone_number' => '09111111113',
                'date_of_birth' => '1999-12-10',
                'sex' => 'Female',
                'department_id' => 2,
                'course_id' => 3,
                'academic_year_id' => 1,
                'year_level' => 'Senior',
                'status' => 'Active'
            ],
            [
                'f_name' => 'David',
                'l_name' => 'Wilson',
                'email_address' => 'david.wilson@student.edu',
                'phone_number' => '09111111114',
                'date_of_birth' => '2002-05-18',
                'sex' => 'Male',
                'department_id' => 3,
                'course_id' => 4,
                'academic_year_id' => 1,
                'year_level' => 'Sophomore',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Emma',
                'l_name' => 'Taylor',
                'email_address' => 'emma.taylor@student.edu',
                'phone_number' => '09111111115',
                'date_of_birth' => '2001-08-25',
                'sex' => 'Female',
                'department_id' => 4,
                'course_id' => 5,
                'academic_year_id' => 1,
                'year_level' => 'Junior',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Frank',
                'l_name' => 'Anderson',
                'email_address' => 'frank.anderson@student.edu',
                'phone_number' => '09111111116',
                'date_of_birth' => '2000-11-30',
                'sex' => 'Male',
                'department_id' => 5,
                'course_id' => 6,
                'academic_year_id' => 1,
                'year_level' => 'Senior',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Grace',
                'l_name' => 'Martinez',
                'email_address' => 'grace.martinez@student.edu',
                'phone_number' => '09111111117',
                'date_of_birth' => '2002-02-14',
                'sex' => 'Female',
                'department_id' => 1,
                'course_id' => 1,
                'academic_year_id' => 1,
                'year_level' => 'Sophomore',
                'status' => 'Active'
            ],
            [
                'f_name' => 'Henry',
                'l_name' => 'Garcia',
                'email_address' => 'henry.garcia@student.edu',
                'phone_number' => '09111111118',
                'date_of_birth' => '2001-07-08',
                'sex' => 'Male',
                'department_id' => 2,
                'course_id' => 3,
                'academic_year_id' => 1,
                'year_level' => 'Junior',
                'status' => 'Active'
            ],
        ];

        foreach ($students as $student) {
            StudentProfile::firstOrCreate(['email_address' => $student['email_address']], $student);
        }

        $this->command->info('Sample data seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- ' . count($academicYears) . ' Academic Years');
        $this->command->info('- ' . count($departments) . ' Departments');
        $this->command->info('- ' . count($courses) . ' Courses');
        $this->command->info('- ' . count($faculties) . ' Faculty Members');
        $this->command->info('- ' . count($students) . ' Students');
    }
}
