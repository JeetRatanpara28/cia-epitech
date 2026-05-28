import {hashSync} from 'bcryptjs';
import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateAdminUser1572547308077 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hash = hashSync('admin', 12);
    const isSqlite = queryRunner.connection.options.type === 'sqlite';
    if (isSqlite) {
      await queryRunner.query(
        `INSERT OR IGNORE INTO user (username, password, role, createdAt, updatedAt)
         VALUES (?, ?, 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
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
    await queryRunner.query(`DELETE FROM user WHERE username = 'admin'`);
  }
}
