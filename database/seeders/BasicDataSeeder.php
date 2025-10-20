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
        // Departments and courses will be added through the Settings page
        // No sample data seeded

        // Create basic academic years
        DB::table('academic_years')->insert([
            ['school_year' => '2023-2024', 'created_at' => now(), 'updated_at' => now()],
            ['school_year' => '2024-2025', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Faculty and student profiles will be added through their respective pages
        // No sample data seeded

        $this->command->info('Basic data seeded successfully!');
        $this->command->info('Created: 2 Academic Years');
    }
}
