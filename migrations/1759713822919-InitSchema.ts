export class InitSchema1759713822919 {
  // Use `any` for queryRunner to avoid depending on the `typeorm`
  // type declarations in environments where that package is not installed.
  public async up(queryRunner: any): Promise<void> {
    const sql = `
-- PostgreSQL database dump (schema-only)
CREATE TABLE public.author (
    id integer NOT NULL,
    "fullName" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public.author_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.author_id_seq OWNED BY public.author.id;

CREATE TABLE public.book (
    id integer NOT NULL,
    title character varying NOT NULL,
    "isOnLoan" boolean NOT NULL,
    "borrowBookDate" timestamp without time zone,
    "returnBookDate" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "authorId" integer,
    "userId" integer
);

CREATE SEQUENCE public.book_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.book_id_seq OWNED BY public.book.id;

CREATE TABLE public.typeorm_metadata (
    type character varying NOT NULL,
    database character varying,
    schema character varying,
    "table" character varying,
    name character varying,
    value text
);

CREATE TABLE public."user" (
    id integer NOT NULL,
    "fullName" character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "nBooks" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public.user_id_seq AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;

ALTER TABLE ONLY public.author ALTER COLUMN id SET DEFAULT nextval('public.author_id_seq'::regclass);
ALTER TABLE ONLY public.book ALTER COLUMN id SET DEFAULT nextval('public.book_id_seq'::regclass);
ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);

ALTER TABLE ONLY public.author ADD CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY (id);
ALTER TABLE ONLY public.book ADD CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY (id);
ALTER TABLE ONLY public."user" ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);

ALTER TABLE ONLY public.book ADD CONSTRAINT "FK_04f66cf2a34f8efc5dcd9803693" FOREIGN KEY ("userId") REFERENCES public."user"(id);
ALTER TABLE ONLY public.book ADD CONSTRAINT "FK_66a4f0f47943a0d99c16ecf90b2" FOREIGN KEY ("authorId") REFERENCES public.author(id) ON DELETE CASCADE;
`;

    await queryRunner.query(sql);
  }

  public async down(queryRunner: any): Promise<void> {
    const sql = `
DROP TABLE IF EXISTS public.book CASCADE;
DROP TABLE IF EXISTS public.author CASCADE;
DROP TABLE IF EXISTS public."user" CASCADE;
DROP TABLE IF EXISTS public.typeorm_metadata CASCADE;
DROP SEQUENCE IF EXISTS public.book_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.author_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.user_id_seq CASCADE;
`;

    await queryRunner.query(sql);
  }
}
