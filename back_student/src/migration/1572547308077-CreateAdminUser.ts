import {hashSync} from 'bcryptjs';
import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateAdminUser1572547308077 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hash = hashSync('Admin@12345', 12);
    const type = queryRunner.connection.options.type;

    if (type === 'sqlite') {
      await queryRunner.query(
        `INSERT OR IGNORE INTO user (username, password, role, createdAt, updatedAt)
         VALUES (?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        ['admin', hash],
      );
    } else if (type === 'postgres') {
      await queryRunner.query(
        `INSERT INTO "user" (username, password, role, "createdAt", "updatedAt")
         VALUES ($1, $2, 'ADMIN', NOW(), NOW())
         ON CONFLICT (username) DO NOTHING`,
        ['admin', hash],
      );
    } else {
      await queryRunner.query(
        `INSERT INTO user (username, password, role, createdAt, updatedAt)
         VALUES (?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE id=id`,
        ['admin', hash],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const type = queryRunner.connection.options.type;
    if (type === 'postgres') {
      await queryRunner.query(`DELETE FROM "user" WHERE username = 'admin'`);
    } else {
      await queryRunner.query(`DELETE FROM user WHERE username = 'admin'`);
    }
  }
}
