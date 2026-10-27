
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Medicare backend is running!");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "hospital",
      port: Number(process.env.DB_PORT || 3306)
    });

    const [rows] = await connection.query(
      "SELECT COUNT(*) AS total FROM patient"
    );

    await connection.end();

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      patientRecords: rows[0].total
    });
  } catch (error) {
    console.error("MySQL error:", error.message);
    res.status(500).json({
      success: false,
      message: "MySQL connection failed. Check your .env settings."
    });
  }
});
app.get("/api/patients", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "hospital",
      port: Number(process.env.DB_PORT || 3306)
    });

    const [rows] = await connection.query(
      "SELECT * FROM patient ORDER BY patient_id"
    );

    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error("Patients API error:", error.message);
    res.status(500).json({ message: "Unable to load patients" });
  }
});
app.post("/api/patients", async (req, res) => {
  const { patient_id, name, age, ph_no, gender } = req.body;

  if (!patient_id || !name || !age || !gender) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields."
    });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "hospital",
      port: Number(process.env.DB_PORT || 3306)
    });

    await connection.execute(
      `INSERT INTO patient (patient_id, name, age, phone_number, gender)
      VALUES (?, ?, ?, ?, ?)`,
      [patient_id, name, age, ph_no || null, gender]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: "Patient saved successfully!"
    });
  } catch (error) {
    console.error("Add patient error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not save patient. Check the patient ID and database fields."
    });
  }
});
app.delete("/api/patients/:id", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "hospital",
      port: Number(process.env.DB_PORT || 3306)
    });

    const [result] = await connection.execute(
      "DELETE FROM patient WHERE patient_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Patient not found."
      });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully!"
    });
  } catch (error) {
    console.error("Delete patient error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not delete patient."
    });
  } finally {
    if (connection) await connection.end();
  }
});
// Get all doctors
app.get("/api/doctors", async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || "hospital",
      port: Number(process.env.DB_PORT || 3306)
    });

    const [rows] = await connection.query(
      "SELECT * FROM doctor ORDER BY Doctor_id"
    );

    res.json(rows);
  } catch (error) {
    console.error("Doctors API error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load doctors."
    });
  } finally {
    if (connection) await connection.end();
  }
});
// Add a new doctor
app.post("/api/doctors", async (req, res) => {
    const { Doctor_id, name, phone_number, specialization, experience } = req.body;

    if (!Doctor_id || !name) {
        return res.status(400).json({
            success: false,
            message: "Doctor ID and name are required."
        });
    }

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        await connection.execute(
            `INSERT INTO doctor
            (Doctor_id, name, phone_number, specialization, experience)
            VALUES (?, ?, ?, ?, ?)`,
            [
                Doctor_id,
                name,
                phone_number || null,
                specialization || null,
                experience ? `${experience} Years` : null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Doctor added successfully!"
        });

    } catch (error) {
        console.error("Add doctor error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not save doctor. Check the Doctor ID and database fields."
        });

    } finally {
        if (connection) await connection.end();
    }
});
app.delete("/api/doctors/:id", async (req, res) => {
    const doctorId = req.params.id;
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [result] = await connection.execute(
            "DELETE FROM doctor WHERE Doctor_id = ?",
            [doctorId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found."
            });
        }

        res.json({
            success: true,
            message: "Doctor deleted successfully!"
        });

    } catch (error) {
        console.error("Delete doctor error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not delete doctor."
        });
    } finally {
        if (connection) await connection.end();
    }
});
// GET: Fetch all appointments
app.get("/api/appointments", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [rows] = await connection.query(`
            SELECT
                app_id,
                patient_id,
                doctor_id,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                room_number,
                time
            FROM appointment
            ORDER BY date DESC, time DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error("Appointments API error:", error.message);
        res.status(500).json({
            success: false,
            message: "Unable to load appointments."
        });
    } finally {
        if (connection) await connection.end();
    }
});


// POST: Add a new appointment
app.post("/api/appointments", async (req, res) => {
    const {
        app_id,
        patient_id,
        doctor_id,
        date,
        room_number,
        time
    } = req.body;

    if (!app_id || !patient_id || !doctor_id || !date || !time) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required appointment fields."
        });
    }

    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        await connection.execute(
            `INSERT INTO appointment
             (app_id, patient_id, doctor_id, date, room_number, time)
             VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                app_id,
                patient_id,
                doctor_id,
                date,
                room_number || null,
                time
            ]
        );

        console.log("Appointment inserted:", app_id);

              res.status(201).json({
            success: true,
            message: "Appointment saved successfully!"
        });

    } catch (error) {
        console.error("Add appointment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Could not save appointment. Check IDs and database fields."
        });
    } finally {
        if (connection) await connection.end();
    }
});
// DELETE appointment from MySQL
app.delete("/api/appointments/:id", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [result] = await connection.execute(
            "DELETE FROM appointment WHERE app_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment deleted successfully!"
        });

    } catch (error) {
        console.error("Delete appointment error:", error.message);
        res.status(500).json({
            success: false,
            message: "Database could not delete the appointment."
        });
    } finally {
        if (connection) await connection.end();
    }
});
// GET all medicines
app.get("/api/medicines", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [rows] = await connection.execute(
            "SELECT * FROM medicine"
        );

        res.json(rows);

    } catch (error) {
        console.error("Fetch medicines error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not fetch medicines."
        });

    } finally {
        if (connection) await connection.end();
    }
});
// ADD MEDICINE
app.post("/api/medicines", async (req, res) => {
    let connection;

    try {
        const { m_id, medicine_name, quantity, expiry_date, price } = req.body;

        if (!m_id || !medicine_name) {
            return res.status(400).json({
                success: false,
                message: "Medicine ID and name are required."
            });
        }

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        await connection.execute(
            `INSERT INTO medicine
            (m_id, medicine_name, quantity, expiry_date, price)
            VALUES (?, ?, ?, ?, ?)`,
            [
                m_id,
                medicine_name,
                quantity || 0,
                expiry_date || null,
                price || "0"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Medicine added successfully!"
        });

    } catch (error) {
        console.error("Add medicine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not add medicine. Check the server terminal."
        });

    } finally {
        if (connection) await connection.end();
    }
});
// DELETE MEDICINE
app.delete("/api/medicines/:id", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [result] = await connection.execute(
            "DELETE FROM medicine WHERE m_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found."
            });
        }

        res.json({
            success: true,
            message: "Medicine deleted successfully!"
        });

    } catch (error) {
        console.error("Delete medicine error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not delete medicine."
        });

    } finally {
        if (connection) await connection.end();
    }
});
// GET ALL BILLS
app.get("/api/bills", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [rows] = await connection.execute(
            "SELECT * FROM bill"
        );

        res.json(rows);

    } catch (error) {
        console.error("Fetch bills error:", error.message);
        res.status(500).json({
            success: false,
            message: "Could not fetch bills."
        });

    } finally {
        if (connection) await connection.end();
    }
});
// CREATE BILL
app.post("/api/bills", async (req, res) => {
    let connection;

    try {
        const { bill_id, patient_id, payment_mode, date, amount } = req.body;

        if (!bill_id || !patient_id || !payment_mode || !date || amount === undefined || amount === "") {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });
        }

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        await connection.execute(
            "INSERT INTO bill (bill_id, patient_id, payment_mode, date, amount) VALUES (?, ?, ?, ?, ?)",
            [bill_id, patient_id, payment_mode, date, String(amount)]
        );

        res.status(201).json({
            success: true,
            message: "Bill created successfully."
        });

    } catch (error) {
        console.error("Create bill error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});


// DELETE BILL
app.delete("/api/bills/:id", async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || "localhost",
            user: process.env.DB_USER || "root",
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || "hospital",
            port: Number(process.env.DB_PORT || 3306)
        });

        const [result] = await connection.execute(
            "DELETE FROM bill WHERE bill_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found."
            });
        }

        res.json({
            success: true,
            message: "Bill deleted successfully."
        });

    } catch (error) {
        console.error("Delete bill error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
});
app.listen(3000, "127.0.0.1", () => {
    console.log("Medicare backend running on port 3000");
});

