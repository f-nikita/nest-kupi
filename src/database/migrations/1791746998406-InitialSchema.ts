import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791746998406 implements MigrationInterface {
  name = 'InitialSchema1791746998406';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "wishes" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(250) NOT NULL, "link" character varying(255) NOT NULL, "image" character varying(255) NOT NULL, "price" numeric(10,2) NOT NULL, "raised" numeric(10,2) NOT NULL DEFAULT '0', "description" character varying(1024) NOT NULL, "copied" integer NOT NULL DEFAULT '0', "ownerId" integer, CONSTRAINT "PK_9c08d144e42ca0aa37a024597ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishlists" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(250) NOT NULL, "description" character varying(1500), "image" character varying NOT NULL DEFAULT 'https://pravatar.cc', "ownerId" integer, CONSTRAINT "PK_d0a37f2848c5d268d315325f359" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying(30) NOT NULL, "about" character varying(200) NOT NULL DEFAULT 'Пока ничего не рассказал о себе', "avatar" character varying NOT NULL DEFAULT 'https://i.pravatar.cc/300', "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "amount" numeric(10,2) NOT NULL, "hidden" boolean NOT NULL DEFAULT false, "userId" integer NOT NULL, "itemId" integer NOT NULL, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "wishlists_items_wishes" ("wishlistsId" integer NOT NULL, "wishesId" integer NOT NULL, CONSTRAINT "PK_120261bf94aab7af4e5865c3647" PRIMARY KEY ("wishlistsId", "wishesId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51615f7431377197e31b942949" ON "wishlists_items_wishes"  ("wishlistsId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_bff5108d5f4117f9e5da1fad20" ON "wishlists_items_wishes"  ("wishesId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "wishes" ADD CONSTRAINT "FK_72f773f4c32469a4871dfe0dd9b" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" ADD CONSTRAINT "FK_fb4ebe59fc41632038a442821db" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_dee629b1248f4ad48268faa9ea1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_831fb094e15af462abaf6bbfd62" FOREIGN KEY ("itemId") REFERENCES "wishes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists_items_wishes" ADD CONSTRAINT "FK_51615f7431377197e31b942949b" FOREIGN KEY ("wishlistsId") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists_items_wishes" ADD CONSTRAINT "FK_bff5108d5f4117f9e5da1fad200" FOREIGN KEY ("wishesId") REFERENCES "wishes"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wishlists_items_wishes" DROP CONSTRAINT "FK_bff5108d5f4117f9e5da1fad200"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists_items_wishes" DROP CONSTRAINT "FK_51615f7431377197e31b942949b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_831fb094e15af462abaf6bbfd62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_dee629b1248f4ad48268faa9ea1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishlists" DROP CONSTRAINT "FK_fb4ebe59fc41632038a442821db"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wishes" DROP CONSTRAINT "FK_72f773f4c32469a4871dfe0dd9b"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_bff5108d5f4117f9e5da1fad20"`);
    await queryRunner.query(`DROP INDEX "IDX_51615f7431377197e31b942949"`);
    await queryRunner.query(`DROP TABLE "wishlists_items_wishes"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "wishlists"`);
    await queryRunner.query(`DROP TABLE "wishes"`);
  }
}
