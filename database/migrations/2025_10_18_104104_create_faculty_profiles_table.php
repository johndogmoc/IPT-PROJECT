<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFacultyProfilesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('faculty_profiles', function (Blueprint $table) {
            $table->id('faculty_id');
            $table->string('f_name');
            $table->string('m_name')->nullable();
            $table->string('l_name');
            $table->string('suffix')->nullable();
            $table->date('date_of_birth');
            $table->enum('sex', ['Male', 'Female']);
            $table->string('phone_number');
            $table->string('email_address')->unique();
            $table->text('address');
            $table->string('position');
            $table->unsignedBigInteger('department_id');
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('department_id')->references('department_id')->on('departments');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('faculty_profiles');
    }
}
