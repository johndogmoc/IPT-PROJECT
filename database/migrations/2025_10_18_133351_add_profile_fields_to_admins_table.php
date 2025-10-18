<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddProfileFieldsToAdminsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->string('email')->nullable()->after('username');
            $table->string('first_name')->nullable()->after('email');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('last_name');
            $table->text('address')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn(['email', 'first_name', 'last_name', 'phone', 'address']);
        });
    }
}
