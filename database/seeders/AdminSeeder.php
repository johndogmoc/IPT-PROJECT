<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Check if admins table exists, if not create it
        if (!Schema::hasTable('admins')) {
            Schema::create('admins', function (Blueprint $table) {
                $table->id('admin_id');
                $table->string('username')->unique();
                $table->string('password');
                $table->timestamps();
            });
        }

        // Check if admin already exists
        $existingAdmin = DB::table('admins')->where('username', 'admin')->first();
        if (!$existingAdmin) {
            // Create default admin account
            DB::table('admins')->insert([
                'admin_id' => 1,
                'username' => 'admin',
                'password' => Hash::make('admin123'), // Secure password
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Check if superadmin already exists
        $existingSuperAdmin = DB::table('admins')->where('username', 'superadmin')->first();
        if (!$existingSuperAdmin) {
            // Create additional admin accounts if needed
            DB::table('admins')->insert([
                'admin_id' => 2,
                'username' => 'superadmin',
                'password' => Hash::make('superadmin2025'), // More secure password
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Admin accounts seeded successfully!');
        $this->command->info('Default credentials:');
        $this->command->info('Username: admin | Password: admin123');
        $this->command->info('Username: superadmin | Password: superadmin2025');
    }
}