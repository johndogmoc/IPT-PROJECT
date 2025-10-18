<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BasicDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create basic departments
        DB::table('departments')->insert([
            ['department_name' => 'Computer Science', 'department_head' => 'Dr. John Smith', 'created_at' => now(), 'updated_at' => now()],
            ['department_name' => 'Business Administration', 'department_head' => 'Dr. Jane Doe', 'created_at' => now(), 'updated_at' => now()],
            ['department_name' => 'Nursing', 'department_head' => 'Dr. Michael Johnson', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Create basic courses
        DB::table('courses')->insert([
            ['course_name' => 'Bachelor of Science in Computer Science', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['course_name' => 'Bachelor of Science in Information Technology', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['course_name' => 'Bachelor of Science in Business Administration', 'department_id' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['course_name' => 'Bachelor of Science in Nursing', 'department_id' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Create basic academic years
        DB::table('academic_years')->insert([
            ['school_year' => '2023-2024', 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2024-2025', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Create basic faculty profiles
        DB::table('faculty_profiles')->insert([
            [
                'f_name' => 'John',
                'l_name' => 'Smith',
                'email_address' => 'john.smith@university.edu',
                'phone_number' => '09123456789',
                'date_of_birth' => '1980-01-15',
                'sex' => 'Male',
                'address' => '123 Main St, City',
                'department_id' => 1,
                'position' => 'Professor',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'f_name' => 'Jane',
                'l_name' => 'Doe',
                'email_address' => 'jane.doe@university.edu',
                'phone_number' => '09123456790',
                'date_of_birth' => '1985-05-20',
                'sex' => 'Female',
                'address' => '456 Oak Ave, City',
                'department_id' => 2,
                'position' => 'Associate Professor',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);

        // Create basic student profiles
        DB::table('student_profiles')->insert([
            [
                'f_name' => 'Alice',
                'l_name' => 'Johnson',
                'email_address' => 'alice.johnson@student.edu',
                'phone_number' => '09111111111',
                'date_of_birth' => '2000-01-15',
                'sex' => 'Female',
                'address' => '789 Pine St, City',
                'department_id' => 1,
                'course_id' => 1,
                'academic_year_id' => 1,
                'year_level' => 4,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'f_name' => 'Bob',
                'l_name' => 'Smith',
                'email_address' => 'bob.smith@student.edu',
                'phone_number' => '09111111112',
                'date_of_birth' => '2001-03-22',
                'sex' => 'Male',
                'address' => '321 Elm St, City',
                'department_id' => 1,
                'course_id' => 2,
                'academic_year_id' => 1,
                'year_level' => 3,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'f_name' => 'Carol',
                'l_name' => 'Davis',
                'email_address' => 'carol.davis@student.edu',
                'phone_number' => '09111111113',
                'date_of_birth' => '1999-12-10',
                'sex' => 'Female',
                'address' => '654 Maple Ave, City',
                'department_id' => 2,
                'course_id' => 3,
                'academic_year_id' => 1,
                'year_level' => 4,
                'status' => 'Active',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);

        $this->command->info('Basic data seeded successfully!');
        $this->command->info('Created: 3 Departments, 4 Courses, 2 Academic Years, 2 Faculty, 3 Students');
    }
}
