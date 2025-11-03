"use strict";

const fs = require("fs");
const path = require("path");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get models - we need to use the models directly
    // In migrations/seeders, we use queryInterface.sequelize
    const sequelize = queryInterface.sequelize;
    const { initializeModels, setupAssociations } = require("../models");
    const models = setupAssociations(initializeModels(sequelize));

    const {
      WardSecretariat,
      Household,
      Resident,
      ResidentKYC,
      ResidentEmployment,
      Scheme,
      SchemeEnrollment,
    } = models;

    console.log("🌱 Starting data seeding from JSON file...");

    // Read JSON file
    const jsonPath = path.join(__dirname, "../../../seed-data.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    // Get the data array (first key contains the data)
    const dataKey = Object.keys(jsonData)[0];
    const rawData = jsonData[dataKey];

    if (!rawData || !Array.isArray(rawData)) {
      throw new Error("Invalid JSON structure");
    }

    console.log(`📊 Found ${rawData.length} records to process`);

    // Helper functions
    const normalizeGender = (gender) => {
      if (!gender) return "prefer_not_to_say";
      const g = String(gender).toLowerCase().trim();
      if (g === "m" || g === "male") return "male";
      if (g === "f" || g === "female") return "female";
      return "prefer_not_to_say";
    };

    const normalizeEducationLevel = (qualification) => {
      if (!qualification) return null;
      const q = String(qualification).toLowerCase().trim();
      if (q.includes("un") && q.includes("educat")) return "illiterate";
      if (q.includes("primary") || q.includes("5th")) return "primary";
      if (q.includes("secondary") || q.includes("10th")) return "secondary";
      if (q.includes("higher") || q.includes("inter") || q.includes("12th"))
        return "higher_secondary";
      if (
        q.includes("graduate") ||
        q.includes("bachelor") ||
        q.includes("ba ") ||
        q.includes("bsc ") ||
        q.includes("b.com")
      )
        return "graduate";
      if (
        q.includes("post") ||
        q.includes("mba") ||
        q.includes("mca") ||
        q.includes("m.sc")
      )
        return "post_graduate";
      if (q.includes("diploma")) return "professional";
      if (q.includes("9th") || q.includes("class")) return "secondary";
      return "other";
    };

    const normalizeEmploymentStatus = (occupation, needEmployment) => {
      if (!occupation || occupation === "-" || occupation === null) {
        if (needEmployment === "JOB" || needEmployment === "YES") {
          return "seeking_employment";
        }
        return "unemployed";
      }
      const occ = String(occupation).toLowerCase().trim();
      if (occ.includes("student")) return "student";
      if (occ.includes("house") || occ.includes("wife")) return "homemaker";
      if (occ.includes("retired") || occ.includes("pension")) return "retired";
      if (occ.includes("employed") || occ.includes("employee"))
        return "employed";
      if (occ.includes("self") || occ.includes("business"))
        return "self_employed";
      if (needEmployment === "JOB" || needEmployment === "YES") {
        return "seeking_employment";
      }
      return "unemployed";
    };

    const normalizeQualificationLevel = (qualification) => {
      if (!qualification) return null;
      const q = String(qualification).toLowerCase().trim();
      if (q.includes("un") && q.includes("educat")) return "below_10th";
      if (q.includes("10th") || q === "10th") return "10th_pass";
      if (q.includes("12th") || q.includes("inter")) return "12th_pass";
      if (q.includes("diploma")) return "diploma";
      if (
        q.includes("graduate") ||
        q.includes("bachelor") ||
        q.includes("ba ") ||
        q.includes("bsc") ||
        q.includes("b.com")
      )
        return "graduation";
      if (
        q.includes("post") ||
        q.includes("mba") ||
        q.includes("mca") ||
        q.includes("m.sc") ||
        q.includes("master")
      )
        return "post_graduation";
      if (q.includes("phd")) return "phd";
      if (q.includes("9th") || q.includes("5th") || q.includes("class"))
        return "below_10th";
      return null;
    };

    const parseDateOfBirth = (dateStr, day, month, year) => {
      // First try the AGE/DOB field (ISO date string like "1960-01-01T00:00:00")
      if (
        dateStr &&
        dateStr !== "-" &&
        dateStr !== null &&
        dateStr !== undefined
      ) {
        try {
          const date = new Date(dateStr);
          // Validate the date is reasonable (between 1900 and current year)
          if (
            !isNaN(date.getTime()) &&
            date.getFullYear() >= 1900 &&
            date.getFullYear() <= new Date().getFullYear()
          ) {
            return date.toISOString().split("T")[0];
          }
        } catch (e) {
          // Fall through to try DATE, MONTH, YEAR
        }
      }

      // Fall back to DATE, MONTH, YEAR fields
      if (year && month && day) {
        try {
          // Validate year is reasonable (1900 to current year)
          const yearInt = parseInt(year);
          if (yearInt >= 1900 && yearInt <= new Date().getFullYear()) {
            // Validate and normalize month (1-12)
            const monthInt = Math.max(1, Math.min(12, parseInt(month)));
            // Validate and normalize day (1-31, Date object will handle invalid days)
            const dayInt = Math.max(1, Math.min(31, parseInt(day)));
            const date = new Date(yearInt, monthInt - 1, dayInt);

            // Verify the date is valid and matches our inputs
            if (
              !isNaN(date.getTime()) &&
              date.getFullYear() === yearInt &&
              date.getMonth() === monthInt - 1
            ) {
              return date.toISOString().split("T")[0];
            }
          }
        } catch (e) {
          // Invalid date components
        }
      }
      return null;
    };

    const parsePhoneNumber = (phone) => {
      if (!phone || phone === "-") return null;
      const phoneStr = String(phone).replace(/\D/g, "");
      if (phoneStr.length >= 10) {
        return phoneStr.length === 10 ? `+91${phoneStr}` : `+${phoneStr}`;
      }
      return null;
    };

    const parseAadhaar = (aadhaar) => {
      if (!aadhaar || aadhaar === "-") return null;
      const aadhaarStr = String(aadhaar).replace(/\D/g, "");
      return aadhaarStr.length === 12 ? aadhaarStr : null;
    };

    const parseVoterId = (voterId) => {
      if (!voterId || voterId === "-" || voterId === null) return null;
      return String(voterId).trim();
    };

    const parseRiceCard = (riceCard) => {
      if (
        !riceCard ||
        riceCard === "-" ||
        riceCard === "IN ELIGIBLE" ||
        riceCard === "INELIGIBLE" ||
        riceCard === null
      ) {
        return null;
      }
      return String(riceCard).trim();
    };

    // Group data by RICE CARD NO (household)
    const householdMap = new Map();
    const processedHouseholds = new Set();

    rawData.forEach((record) => {
      const riceCardNo = parseRiceCard(record["RICE CARD NO"]);
      if (!riceCardNo) {
        // Skip invalid rice card numbers
        return;
      }

      if (!householdMap.has(riceCardNo)) {
        householdMap.set(riceCardNo, {
          riceCardNo,
          address: record.ADRESS || record.ADDRESS || "-",
          landmark: record.LANDMARK || null,
          familyMembers: parseInt(record["NO OF FAMILY MEMBERS"]) || 1,
          residents: [],
        });
      }

      householdMap.get(riceCardNo).residents.push(record);
    });

    console.log(`🏠 Found ${householdMap.size} unique households`);

    // Create or get Ward Secretariat
    let wardSecretariat;
    try {
      [wardSecretariat] = await WardSecretariat.findOrCreate({
        where: {
          ward_number: "WARD001",
        },
        defaults: {
          ward_number: "WARD001",
          ward_name: "Sreeramulapeta Ward",
          secretariat_name: "Sreeramulapeta Secretariat".substring(0, 255), // Ensure within limit
          secretariat_code: "SRMP001",
          area_description: "Sreeramulapeta area with all clusters",
          pincode: "533001",
          is_active: true,
        },
      });
      console.log(
        `✅ Ward Secretariat created/found: ${wardSecretariat.ward_name}`
      );
    } catch (error) {
      console.error("❌ Error creating ward secretariat:", error.message);
      // Continue with null ward_secretariat_id
    }

    // Process households
    let householdCount = 0;
    let residentCount = 0;
    let kycCount = 0;
    let employmentCount = 0;

    for (const [riceCardNo, householdData] of householdMap.entries()) {
      try {
        // Parse address
        const addressParts = (householdData.address || "").split(/\s+/);
        const addressLine1 =
          addressParts.slice(0, 3).join(" ") || "Address not provided";
        const addressLine2 = addressParts.slice(3).join(" ") || null;

        // Generate household number
        const householdNumber = `HH${riceCardNo.slice(-8).padStart(8, "0")}`;

        // Create or find household
        let [household, householdCreated] = await Household.findOrCreate({
          where: {
            household_number: householdNumber,
          },
          defaults: {
            household_number: householdNumber,
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            landmark: householdData.landmark || null,
            pincode: "533001", // Default pincode - adjust as needed
            ward_secretariat_id: wardSecretariat?.id || null,
            area: "Sreeramulapeta",
            city: "Rajahmundry",
            state: "Andhra Pradesh",
            property_type: "residential",
            ownership_type: "owned",
            total_members:
              householdData.familyMembers || householdData.residents.length,
            adult_members: householdData.residents.filter((r) => {
              const dob = parseDateOfBirth(
                r["AGE/DOB"],
                r.DATE,
                r.MONTH,
                r.YEAR
              );
              if (!dob) return false;
              const age =
                new Date().getFullYear() - new Date(dob).getFullYear();
              return age >= 18;
            }).length,
            children_count: householdData.residents.filter((r) => {
              const dob = parseDateOfBirth(
                r["AGE/DOB"],
                r.DATE,
                r.MONTH,
                r.YEAR
              );
              if (!dob) return false;
              const age =
                new Date().getFullYear() - new Date(dob).getFullYear();
              return age < 18;
            }).length,
            senior_citizens_count: householdData.residents.filter((r) => {
              const dob = parseDateOfBirth(
                r["AGE/DOB"],
                r.DATE,
                r.MONTH,
                r.YEAR
              );
              if (!dob) return false;
              const age =
                new Date().getFullYear() - new Date(dob).getFullYear();
              return age >= 60;
            }).length,
            primary_contact_number: householdData.residents.find((r) =>
              parsePhoneNumber(r["PH NO"])
            )
              ? parsePhoneNumber(
                  householdData.residents.find((r) =>
                    parsePhoneNumber(r["PH NO"])
                  )["PH NO"]
                )
              : null,
            is_bpl: false,
            ration_card_type: "apl",
            verification_status: "pending",
          },
        });

        if (householdCreated) {
          householdCount++;
        }

        // Determine head of household (first resident or oldest)
        let headResident = householdData.residents[0];
        if (householdData.residents.length > 1) {
          // Find oldest resident
          const sortedByAge = [...householdData.residents].sort((a, b) => {
            const dobA = parseDateOfBirth(
              a["AGE/DOB"],
              a.DATE,
              a.MONTH,
              a.YEAR
            );
            const dobB = parseDateOfBirth(
              b["AGE/DOB"],
              b.DATE,
              b.MONTH,
              b.YEAR
            );
            if (!dobA) return 1;
            if (!dobB) return -1;
            return new Date(dobA) - new Date(dobB);
          });
          headResident = sortedByAge[0];
        }

        // Process each resident in the household
        for (let i = 0; i < householdData.residents.length; i++) {
          const record = householdData.residents[i];
          const isHead = record === headResident;

          try {
            // Parse name: format is "LastName FirstName MiddleName"
            const nameParts = (record["NAME OF THE PERSONS"] || "")
              .trim()
              .split(/\s+/)
              .filter((part) => part.length > 0);

            let lastName = "";
            let firstName = "";
            let middleName = null;

            if (nameParts.length === 0) {
              firstName = "Unknown";
              lastName = "Unknown";
            } else if (nameParts.length === 1) {
              // Only one part - treat as first name
              firstName = nameParts[0];
              lastName = nameParts[0];
            } else if (nameParts.length === 2) {
              // Two parts: LastName FirstName
              lastName = nameParts[0];
              firstName = nameParts[1];
            } else {
              // Three or more parts: LastName FirstName MiddleName(s)
              lastName = nameParts[0];
              firstName = nameParts[1];
              middleName = nameParts.slice(2).join(" ");
            }

            const dateOfBirth = parseDateOfBirth(
              record["AGE/DOB"],
              record.DATE,
              record.MONTH,
              record.YEAR
            );

            if (!dateOfBirth) {
              console.warn(
                `⚠️  Skipping resident ${firstName} - no valid date of birth`
              );
              continue;
            }

            // Check if resident already exists (by household_id, name, and DOB)
            const existingResident = await Resident.findOne({
              where: {
                household_id: household.id,
                first_name: firstName,
                last_name: lastName,
                date_of_birth: dateOfBirth,
              },
            });

            let resident;
            let residentCreated = false;

            if (existingResident) {
              resident = existingResident;
            } else {
              // Generate unique resident_id (use household number + index to ensure uniqueness)
              const householdPrefix = household.household_number
                .replace("HH", "")
                .slice(-6);
              const timestamp = Date.now().toString().slice(-8);
              const random = Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0");
              const residentId = `RES${householdPrefix}${timestamp.slice(
                -4
              )}${random}`;

              // Create resident
              try {
                [resident, residentCreated] = await Resident.findOrCreate({
                  where: {
                    household_id: household.id,
                    first_name: firstName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth,
                  },
                  defaults: {
                    household_id: household.id,
                    resident_id: residentId,
                    first_name: firstName,
                    middle_name: middleName,
                    last_name: lastName,
                    date_of_birth: dateOfBirth,
                    gender: normalizeGender(record.GENDER),
                    phone_number: parsePhoneNumber(record["PH NO"]),
                    occupation:
                      record.OCCUPATION &&
                      record.OCCUPATION !== "-" &&
                      record.OCCUPATION !== null
                        ? record.OCCUPATION
                        : null,
                    education_level: normalizeEducationLevel(
                      record.QUALIFICATION
                    ),
                    is_head_of_household: isHead,
                    is_active: true,
                    relationship_to_head: isHead ? "head" : "other",
                  },
                });

                if (residentCreated) {
                  residentCount++;
                  console.log(
                    `✅ Created resident: ${firstName} ${lastName} (${residentId})`
                  );
                } else {
                  console.log(
                    `ℹ️  Resident already exists: ${firstName} ${lastName}`
                  );
                }
              } catch (residentError) {
                console.error(
                  `❌ Error creating resident ${firstName} ${lastName}:`,
                  residentError.message
                );
                console.error("Full error:", residentError);
                continue; // Skip this resident and continue with next
              }
            }

            // Create KYC record (only if resident exists)
            if (!resident) {
              console.warn(`⚠️  Skipping KYC - resident not created`);
              continue;
            }
            const aadhaar = parseAadhaar(record["AADHAR NO"]);
            const voterId = parseVoterId(record["VOTER ID NO"]);
            const riceCard = parseRiceCard(record["RICE CARD NO"]);

            if (aadhaar || voterId || riceCard) {
              try {
                const [kycRecord, kycCreated] = await ResidentKYC.findOrCreate({
                  where: {
                    resident_id: resident.id,
                  },
                  defaults: {
                    resident_id: resident.id,
                    aadhaar_number: aadhaar,
                    aadhaar_verified: !!aadhaar,
                    aadhaar_verification_date: aadhaar ? new Date() : null,
                    voter_id: voterId,
                    voter_id_verified: !!voterId,
                    voter_id_verification_date: voterId ? new Date() : null,
                    rice_card_number: riceCard,
                    rice_card_verified: !!riceCard,
                    arogyasri_card_number:
                      record.AROGYASRI === "YES"
                        ? `AROG${
                            aadhaar?.slice(-8) ||
                            Date.now().toString().slice(-8)
                          }`
                        : null,
                    arogyasri_verified: record.AROGYASRI === "YES",
                    kyc_status: aadhaar && voterId ? "complete" : "partial",
                    kyc_completion_percentage:
                      aadhaar && voterId ? 100 : aadhaar || voterId ? 50 : 0,
                  },
                });

                // Update existing KYC if needed
                if (!kycCreated && (aadhaar || voterId || riceCard)) {
                  const updateData = {};
                  if (aadhaar && !kycRecord.aadhaar_number) {
                    updateData.aadhaar_number = aadhaar;
                    updateData.aadhaar_verified = true;
                    updateData.aadhaar_verification_date = new Date();
                  }
                  if (voterId && !kycRecord.voter_id) {
                    updateData.voter_id = voterId;
                    updateData.voter_id_verified = true;
                    updateData.voter_id_verification_date = new Date();
                  }
                  if (riceCard && !kycRecord.rice_card_number) {
                    updateData.rice_card_number = riceCard;
                    updateData.rice_card_verified = true;
                  }
                  if (
                    record.AROGYASRI === "YES" &&
                    !kycRecord.arogyasri_card_number
                  ) {
                    updateData.arogyasri_card_number = `AROG${
                      aadhaar?.slice(-8) || Date.now().toString().slice(-8)
                    }`;
                    updateData.arogyasri_verified = true;
                  }
                  if (Object.keys(updateData).length > 0) {
                    await kycRecord.update(updateData);
                  }
                }

                if (kycCreated) {
                  kycCount++;
                }
              } catch (kycError) {
                console.error(
                  `⚠️  Error creating KYC for resident ${resident.resident_id}:`,
                  kycError.message
                );
              }
            }

            // Create employment record
            const employmentStatus = normalizeEmploymentStatus(
              record.OCCUPATION,
              record.NEED_EMPLOYEEMENT
            );

            try {
              const [empRecord, empCreated] =
                await ResidentEmployment.findOrCreate({
                  where: {
                    resident_id: resident.id,
                  },
                  defaults: {
                    resident_id: resident.id,
                    employment_status: employmentStatus,
                    current_occupation:
                      record.OCCUPATION && record.OCCUPATION !== "-"
                        ? record.OCCUPATION
                        : null,
                    seeking_employment:
                      record.NEED_EMPLOYEEMENT === "JOB" ||
                      record.NEED_EMPLOYEEMENT === "YES",
                    highest_qualification: normalizeQualificationLevel(
                      record.QUALIFICATION
                    ),
                    computer_literacy: "none",
                    work_experience_years: 0,
                  },
                });

              // Update existing employment record if needed
              if (!empCreated) {
                const updateData = {};
                if (
                  employmentStatus &&
                  empRecord.employment_status === "unemployed"
                ) {
                  updateData.employment_status = employmentStatus;
                }
                if (
                  record.OCCUPATION &&
                  record.OCCUPATION !== "-" &&
                  !empRecord.current_occupation
                ) {
                  updateData.current_occupation = record.OCCUPATION;
                }
                if (
                  record.NEED_EMPLOYEEMENT === "JOB" ||
                  record.NEED_EMPLOYEEMENT === "YES"
                ) {
                  updateData.seeking_employment = true;
                }
                if (Object.keys(updateData).length > 0) {
                  await empRecord.update(updateData);
                }
              }

              if (empCreated) {
                employmentCount++;
              }
            } catch (empError) {
              console.error(
                `⚠️  Error creating employment for resident ${resident.resident_id}:`,
                empError.message
              );
            }
          } catch (residentError) {
            console.error(
              `❌ Error processing resident:`,
              residentError.message
            );
            continue;
          }
        }

        // Update household member counts using raw SQL for age calculation
        const eighteenYearsAgo = new Date();
        eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
        const sixtyYearsAgo = new Date();
        sixtyYearsAgo.setFullYear(sixtyYearsAgo.getFullYear() - 60);

        const actualResidents = await Resident.count({
          where: { household_id: household.id, is_active: true },
        });

        const adultCount = await Resident.count({
          where: {
            household_id: household.id,
            is_active: true,
            date_of_birth: {
              [Sequelize.Op.lte]: eighteenYearsAgo.toISOString().split("T")[0],
            },
          },
        });

        const childrenCount = await Resident.count({
          where: {
            household_id: household.id,
            is_active: true,
            date_of_birth: {
              [Sequelize.Op.gt]: eighteenYearsAgo.toISOString().split("T")[0],
            },
          },
        });

        const seniorCount = await Resident.count({
          where: {
            household_id: household.id,
            is_active: true,
            date_of_birth: {
              [Sequelize.Op.lte]: sixtyYearsAgo.toISOString().split("T")[0],
            },
          },
        });

        await household.update({
          total_members: actualResidents,
          adult_members: adultCount,
          children_count: childrenCount,
          senior_citizens_count: seniorCount,
        });
      } catch (householdError) {
        console.error(
          `❌ Error processing household ${riceCardNo}:`,
          householdError.message
        );
        continue;
      }

      // Progress logging
      if (householdCount % 50 === 0) {
        console.log(
          `📊 Progress: ${householdCount} households, ${residentCount} residents processed`
        );
      }
    }

    // Create schemes if mentioned in the data
    const schemeNames = new Set();
    rawData.forEach((record) => {
      if (
        record["SCHEMES ELIGIBLE FOR"] &&
        record["SCHEMES ELIGIBLE FOR"] !== "-"
      ) {
        // Split comma-separated scheme names
        const schemeValue = String(record["SCHEMES ELIGIBLE FOR"]).trim();
        const schemes = schemeValue
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
        schemes.forEach((scheme) => schemeNames.add(scheme));
      }
    });

    console.log(`📋 Found ${schemeNames.size} unique schemes mentioned`);
    let schemeCreatedCount = 0;
    const usedSchemeCodes = new Set();
    const schemeMap = new Map(); // Map scheme name to scheme object

    for (const schemeName of schemeNames) {
      try {
        // Create a consistent scheme code from the name
        let schemeCodeBase = String(schemeName)
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .substring(0, 10);

        if (!schemeCodeBase) {
          schemeCodeBase = `SCHEME${schemeCreatedCount}`;
        }

        // Ensure uniqueness by adding suffix if needed
        let finalSchemeCode = schemeCodeBase;
        let suffix = 0;
        while (
          usedSchemeCodes.has(finalSchemeCode) &&
          finalSchemeCode.length < 50
        ) {
          suffix++;
          finalSchemeCode = `${schemeCodeBase}${suffix}`;
        }

        // Truncate to max 50 chars (as per migration)
        finalSchemeCode = finalSchemeCode.substring(0, 50);
        usedSchemeCodes.add(finalSchemeCode);

        const [scheme, created] = await Scheme.findOrCreate({
          where: {
            scheme_name: String(schemeName).trim(),
          },
          defaults: {
            scheme_code: finalSchemeCode,
            scheme_name: String(schemeName).trim(),
            implementing_department: "Local Administration".substring(0, 100), // Ensure within limit
            scheme_status: "active",
          },
        });

        // Store in map for later enrollment creation
        schemeMap.set(String(schemeName).trim(), scheme);

        if (created) {
          schemeCreatedCount++;
        }
      } catch (schemeError) {
        console.error(
          `⚠️  Error creating scheme ${schemeName}:`,
          schemeError.message
        );
      }
    }

    // Create scheme enrollments - associate residents with schemes
    console.log(`\n📝 Creating scheme enrollments...`);
    let enrollmentCount = 0;
    const enrollmentErrors = [];

    // Build a map of rice card numbers to residents for quick lookup
    const residentMap = new Map();
    const allResidents = await Resident.findAll({
      attributes: ["id", "resident_id", "household_id"],
      include: [
        {
          model: Household,
          as: "household",
          attributes: ["household_number"],
        },
      ],
    });

    // Map residents by rice card (via household) - we'll match by address/rice card
    // Actually, we need to match by the data we have. Let's iterate through rawData again
    for (const record of rawData) {
      try {
        const schemeValue = record["SCHEMES ELIGIBLE FOR"];
        if (
          !schemeValue ||
          schemeValue === "-" ||
          String(schemeValue).trim() === ""
        ) {
          continue;
        }

        // Split comma-separated scheme names
        const schemeNames = String(schemeValue)
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        if (schemeNames.length === 0) {
          continue;
        }

        // Find the resident by matching household address and resident name
        const addressLine1 = String(record.ADRESS || "").trim();
        const riceCardNo = String(record["RICE CARD NO"] || "").trim();

        // Find household by address or rice card
        const household = await Household.findOne({
          where: {
            [Sequelize.Op.or]: [
              { address_line1: addressLine1 },
              ...(riceCardNo ? [{ household_number: `HH${riceCardNo}` }] : []),
            ],
          },
          attributes: ["id", "household_number"],
        });

        if (!household) {
          continue;
        }

        // Parse name to find resident
        const fullName = String(record["NAME OF THE PERSONS"] || "").trim();
        const nameParts = fullName.split(/\s+/).filter((p) => p.length > 0);

        if (nameParts.length === 0) {
          continue;
        }

        let firstName, lastName, middleName;
        if (nameParts.length === 1) {
          firstName = nameParts[0];
          lastName = nameParts[0];
        } else if (nameParts.length === 2) {
          lastName = nameParts[0];
          firstName = nameParts[1];
        } else {
          lastName = nameParts[0];
          firstName = nameParts[1];
          middleName = nameParts.slice(2).join(" ");
        }

        const dateOfBirth = parseDateOfBirth(
          record["AGE/DOB"],
          record.DATE,
          record.MONTH,
          record.YEAR
        );

        if (!dateOfBirth) {
          continue;
        }

        // Find resident
        const resident = await Resident.findOne({
          where: {
            household_id: household.id,
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth,
          },
          attributes: ["id", "resident_id", "household_id"],
        });

        if (!resident) {
          continue;
        }

        // Create enrollment for each scheme
        for (const schemeName of schemeNames) {
          // Find the scheme
          const scheme = schemeMap.get(schemeName);
          if (!scheme) {
            continue;
          }

          // Check if enrollment already exists
          const existingEnrollment = await SchemeEnrollment.findOne({
            where: {
              resident_id: resident.id,
              scheme_id: scheme.id,
            },
          });

          if (existingEnrollment) {
            continue; // Already enrolled
          }

          // Create enrollment
          try {
            const enrollment = await SchemeEnrollment.create({
              resident_id: resident.id,
              scheme_id: scheme.id,
              household_id: household.id,
              application_date: new Date(),
              status: "approved", // Use status from migration ENUM: pending, approved, rejected, suspended, completed
            });

            enrollmentCount++;
          } catch (enrollmentError) {
            enrollmentErrors.push({
              resident: `${firstName} ${lastName}`,
              scheme: schemeName,
              error: enrollmentError.message,
            });
          }
        }
      } catch (recordError) {
        enrollmentErrors.push({
          record: record["NAME OF THE PERSONS"] || "Unknown",
          error: recordError.message,
        });
      }
    }

    if (enrollmentErrors.length > 0 && enrollmentErrors.length <= 10) {
      console.warn(`⚠️  Some enrollment errors occurred:`);
      enrollmentErrors.forEach((err) => {
        console.warn(`   - ${err.resident || err.record}: ${err.error}`);
      });
    } else if (enrollmentErrors.length > 10) {
      console.warn(
        `⚠️  ${enrollmentErrors.length} enrollment errors occurred (showing first 5):`
      );
      enrollmentErrors.slice(0, 5).forEach((err) => {
        console.warn(`   - ${err.resident || err.record}: ${err.error}`);
      });
    }

    console.log("\n✅ Seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Households: ${householdCount}`);
    console.log(`   - Residents: ${residentCount}`);
    console.log(`   - KYC Records: ${kycCount}`);
    console.log(`   - Employment Records: ${employmentCount}`);
    console.log(`   - Schemes Created: ${schemeCreatedCount}`);
    console.log(`   - Scheme Enrollments: ${enrollmentCount}`);
  },

  down: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;
    const { initializeModels, setupAssociations } = require("../models");
    const models = setupAssociations(initializeModels(sequelize));

    const {
      ResidentEmployment,
      ResidentKYC,
      Resident,
      Household,
      SchemeEnrollment,
      Scheme,
      WardSecretariat,
    } = models;

    console.log("🗑️  Removing seeded data...");

    // Delete in reverse order to respect foreign keys
    await SchemeEnrollment.destroy({ where: {}, force: true });
    await ResidentEmployment.destroy({ where: {}, force: true });
    await ResidentKYC.destroy({ where: {}, force: true });
    await Resident.destroy({ where: {}, force: true });
    await Household.destroy({ where: {}, force: true });

    // Only delete the ward secretariat if it's the one we created
    const wardSecretariat = await WardSecretariat.findOne({
      where: { ward_number: "WARD001" },
    });
    if (wardSecretariat) {
      const householdsInWard = await Household.count({
        where: { ward_secretariat_id: wardSecretariat.id },
      });
      if (householdsInWard === 0) {
        await wardSecretariat.destroy({ force: true });
      }
    }

    console.log("✅ Seeded data removed");
  },
};
