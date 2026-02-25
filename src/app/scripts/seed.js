// src/app/scripts/seed.js
// Script de seed pour les users (nécessite bcrypt pour le hash des mots de passe)
//
// Exécution locale :  node src/app/scripts/seed.js
// Exécution Docker :  docker exec -i <api_container> node scripts/seed.js

const bcrypt = require("bcrypt");
const pool = require("../config/db");

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "Test1234!";

const users = [
  // Admin
  {
    name: "Admin",
    surname: "Onsort",
    email: "admin@onsort.fr",
    username: "admin",
    date_of_birth: "1990-05-15",
    idrole: 1, // Admin
  },
  // User_company (gestionnaires d'entreprise)
  {
    name: "Marie",
    surname: "Dupont",
    email: "company1@onsort.fr",
    username: "marie.dupont",
    date_of_birth: "1985-03-22",
    idrole: 3, // User_company
    idcompany: 1, // Normandie Loisirs
  },
  {
    name: "Pierre",
    surname: "Martin",
    email: "company2@onsort.fr",
    username: "pierre.martin",
    date_of_birth: "1988-11-08",
    idrole: 3, // User_company
    idcompany: 2, // Aventure & Nature
  },
  // Users normaux
  {
    name: "Lucas",
    surname: "Bernard",
    email: "lucas.bernard@mail.com",
    username: "lucas.b",
    date_of_birth: "1995-07-12",
    idrole: 2,
  },
  {
    name: "Emma",
    surname: "Petit",
    email: "emma.petit@mail.com",
    username: "emma.p",
    date_of_birth: "1998-01-30",
    idrole: 2,
  },
  {
    name: "Hugo",
    surname: "Leroy",
    email: "hugo.leroy@mail.com",
    username: "hugo.l",
    date_of_birth: "1992-09-05",
    idrole: 2,
  },
  {
    name: "Chloé",
    surname: "Moreau",
    email: "chloe.moreau@mail.com",
    username: "chloe.m",
    date_of_birth: "2000-04-18",
    idrole: 2,
  },
  {
    name: "Nathan",
    surname: "Girard",
    email: "nathan.girard@mail.com",
    username: "nathan.g",
    date_of_birth: "1997-12-25",
    idrole: 2,
  },
  // Users mineurs
  {
    name: "Léo",
    surname: "Roux",
    email: "leo.roux@mail.com",
    username: "leo.r",
    date_of_birth: "2010-06-14",
    idrole: 2,
  },
  {
    name: "Jade",
    surname: "Fournier",
    email: "jade.fournier@mail.com",
    username: "jade.f",
    date_of_birth: "2011-02-28",
    idrole: 2,
  },
];

async function seed() {
  try {
    console.log("Seeding users...");

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

    // Supprimer les users existants (cascade les relations)
    await pool.query("DELETE FROM user_company");
    await pool.query("DELETE FROM user");

    for (const user of users) {
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const isMinor =
        age < 18 ||
        (age === 18 &&
          today <
            new Date(
              today.getFullYear(),
              birthDate.getMonth(),
              birthDate.getDate()
            ))
          ? 1
          : 0;

      const [result] = await pool.query(
        `INSERT INTO user (name, surname, email, username, password, date_of_birth, is_active, idrole, is_minor)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`,
        [
          user.name,
          user.surname,
          user.email,
          user.username,
          hashedPassword,
          user.date_of_birth,
          user.idrole,
          isMinor,
        ]
      );

      const userId = result.insertId;
      console.log(
        `  + ${user.name} ${user.surname} (${user.email}) - ID: ${userId} - Role: ${user.idrole} - Mineur: ${isMinor ? "oui" : "non"}`
      );

      // Lier les user_company à leur entreprise
      if (user.idcompany) {
        await pool.query(
          "INSERT INTO user_company (iduser, idcompany) VALUES (?, ?)",
          [userId, user.idcompany]
        );
        console.log(`    -> Lié à l'entreprise ${user.idcompany}`);
      }
    }

    console.log("\nSeed terminé avec succès !");
    console.log(`Mot de passe pour tous les users : ${DEFAULT_PASSWORD}`);
    console.log("\nComptes principaux :");
    console.log("  Admin  : admin@onsort.fr / Test1234!");
    console.log("  Company: company1@onsort.fr / Test1234!");
    console.log("  Company: company2@onsort.fr / Test1234!");

    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du seed :", error.message);
    process.exit(1);
  }
}

seed();
