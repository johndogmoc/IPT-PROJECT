<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStudentProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id('student_id');
            $table->string('f_name');
            $table->string('m_name')->nullable();
            $table->string('l_name');
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->enum('sex', ['Male', 'Female']);
            $table->string('phone_number');
            $table->string('email_address')->unique();
            $table->text('address');
            $table->enum('status', ['Active', 'Inactive', 'Graduated', 'Dropped']);
            $table->unsignedBigInteger('department_id');
            $table->unsignedBigInteger('course_id');
            $table->unsignedBigInteger('academic_year_id');
            $table->integer('year_level');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('department_id')->references('department_id')->on('departments');
            $table->foreign('course_id')->references('course_id')->on('courses');
            $table->foreign('academic_year_id')->references('academic_year_id')->on('academic_years');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('student_profiles');
    }
}
