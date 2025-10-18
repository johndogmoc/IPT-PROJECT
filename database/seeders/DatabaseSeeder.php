<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Seed admin accounts and sample data
        $this->call([
            AdminSeeder::class,
            SampleDataSeeder::class,
        ]);
    }
}
