import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Checkbox,
  Input,
  useToast,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { dashboardAPI } from "../utils/api";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAgeChart, setShowAgeChart] = useState(false);
  const [showBirthdayList, setShowBirthdayList] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboard({
        days: 30,
        recent_limit: 10,
      });
      setDashboardData(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getDaysUntilBirthday = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = thisYearBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAgeGroup = (dateOfBirth) => {
    const age = calculateAge(dateOfBirth);
    if (age <= 5) return "0-5";
    if (age <= 10) return "6-10";
    if (age <= 15) return "11-15";
    if (age <= 20) return "16-20";
    if (age <= 25) return "21-25";
    if (age <= 30) return "26-30";
    if (age <= 35) return "31-35";
    if (age <= 40) return "36-40";
    if (age <= 45) return "41-45";
    if (age <= 50) return "46-50";
    if (age <= 55) return "51-55";
    if (age <= 60) return "56-60";
    return "61+";
  };

  const calculateAgeGroups = () => {
    if (!dashboardData?.recent_activities?.new_residents) return {};

    const ageGroups = {};
    dashboardData.recent_activities.new_residents.forEach((resident) => {
      // We need date_of_birth from the resident data
      // For now, let's use the demographics age_groups
    });

    return dashboardData?.demographics?.age_groups || {};
  };

  const getTodayBirthdays = () => {
    if (!dashboardData?.upcoming?.birthdays) return [];

    return dashboardData.upcoming.birthdays.filter((birthday) => {
      const daysUntil = getDaysUntilBirthday(birthday.date_of_birth);
      return daysUntil === 0;
    });
  };

  if (loading) {
    return (
      <Box
        p={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="60vh"
      >
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading dashboard data...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={fetchDashboardData}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box p={8}>
        <Text>No dashboard data available</Text>
      </Box>
    );
  }

  const { overview, demographics, upcoming, data_preview } = dashboardData;
  const genderDist = demographics?.gender_distribution || {};
  const casteDist = demographics?.caste_distribution || {};
  const occupationDist = demographics?.occupation_distribution || {};
  const educationDist = demographics?.education_distribution || {};
  const ageGroupsDetailed = demographics?.age_groups_detailed || {};

  const totalPersons = overview?.total_residents || 0;
  const totalFamilies = overview?.total_households || 0;
  const maleCount = genderDist.male || 0;
  const femaleCount = genderDist.female || 0;
  const malePercentage =
    totalPersons > 0 ? ((maleCount / totalPersons) * 100).toFixed(0) : 0;
  const femalePercentage =
    totalPersons > 0 ? ((femaleCount / totalPersons) * 100).toFixed(0) : 0;

  // Get top 5 for each distribution
  const topCastes = Object.entries(casteDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const topOccupations = Object.entries(occupationDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);
  const topEducation = Object.entries(educationDist)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get today's birthdays (days_until_birthday === 0)
  const todayBirthdays =
    upcoming?.birthdays?.filter((b) => b.days_until_birthday === 0) || [];

  // Get data preview residents
  const previewResidents = data_preview?.residents || [];

  return (
    <Box p={8} bg="gray.50">
      <Heading size="lg" mb={6}>
        Smart Village Dashboard
      </Heading>

      {/* File Upload Section */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Upload file:</Heading>
        </CardHeader>
        <CardBody>
          <HStack spacing={4}>
            <Input
              type="file"
              accept=".xlsx,.xls"
              display="none"
              id="file-upload"
            />
            <Button
              as="label"
              htmlFor="file-upload"
              cursor="pointer"
              colorScheme="blue"
            >
              Choose File Pasajur.xlsx
            </Button>
            <Checkbox defaultChecked>
              Lock DOBs (preserve existing DOBs on upload)
            </Checkbox>
            <Text fontSize="sm" color="blue.500">
              {previewResidents.length} rows uploaded successfully.
            </Text>
          </HStack>
        </CardBody>
      </Card>

      {/* Dashboard Summary */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Dashboard Summary</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <Stat>
              <StatLabel>Total Families</StatLabel>
              <StatNumber>{totalFamilies}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Persons</StatLabel>
              <StatNumber>{totalPersons}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Male</StatLabel>
              <StatNumber>{maleCount}</StatNumber>
              <StatHelpText>{malePercentage}%</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Female</StatLabel>
              <StatNumber>{femaleCount}</StatNumber>
              <StatHelpText>{femalePercentage}%</StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Ration Cards (unique)</StatLabel>
              <StatNumber>{totalFamilies}</StatNumber>
              <StatHelpText>
                Rows with ration: {totalPersons} - missing: 0
              </StatHelpText>
            </Stat>
          </Grid>
        </CardBody>
      </Card>

      {/* Field Summaries */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Field Summaries</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            {/* Caste Summary */}
            <Box>
              <Heading size="sm" mb={3}>
                Caste (top 5)
              </Heading>
              <VStack align="stretch" spacing={2}>
                {topCastes.length > 0 ? (
                  topCastes.map(([caste, count]) => (
                    <HStack key={caste} justify="space-between">
                      <Text>{caste}</Text>
                      <Badge colorScheme="blue">{count}</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" fontSize="sm">
                    No caste data available
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Profession Summary */}
            <Box>
              <Heading size="sm" mb={3}>
                Profession (top 5)
              </Heading>
              <VStack align="stretch" spacing={2}>
                {topOccupations.length > 0 ? (
                  topOccupations.map(([occupation, count]) => (
                    <HStack key={occupation} justify="space-between">
                      <Text>{occupation}</Text>
                      <Badge colorScheme="green">{count}</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" fontSize="sm">
                    No profession data available
                  </Text>
                )}
              </VStack>
            </Box>

            {/* Qualification Summary */}
            <Box>
              <Heading size="sm" mb={3}>
                Qualification (top 5)
              </Heading>
              <VStack align="stretch" spacing={2}>
                {topEducation.length > 0 ? (
                  topEducation.map(([education, count]) => (
                    <HStack key={education} justify="space-between">
                      <Text>{education}</Text>
                      <Badge colorScheme="purple">{count}</Badge>
                    </HStack>
                  ))
                ) : (
                  <Text color="gray.500" fontSize="sm">
                    No education data available
                  </Text>
                )}
              </VStack>
            </Box>
          </Grid>
        </CardBody>
      </Card>

      {/* Age Summary */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Age Summary</Heading>
            <Checkbox
              isChecked={showAgeChart}
              onChange={(e) => setShowAgeChart(e.target.checked)}
            >
              Show chart
            </Checkbox>
          </Flex>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4}>
            {[
              { key: "0-5_years", label: "0-5 years" },
              { key: "6-10_years", label: "6-10 years" },
              { key: "11-15_years", label: "11-15 years" },
              { key: "16-20_years", label: "16-20 years" },
              { key: "21-25_years", label: "21-25 years" },
              { key: "26-30_years", label: "26-30 years" },
              { key: "31-35_years", label: "31-35 years" },
              { key: "36-40_years", label: "36-40 years" },
              { key: "41-45_years", label: "41-45 years" },
              { key: "46-50_years", label: "46-50 years" },
              { key: "51-55_years", label: "51-55 years" },
              { key: "56-60_years", label: "56-60 years" },
              { key: "61+_years", label: "61+ years" },
            ].map((ageGroup) => (
              <Stat key={ageGroup.key}>
                <StatLabel fontSize="xs">{ageGroup.label}</StatLabel>
                <StatNumber fontSize="lg">
                  {ageGroupsDetailed[ageGroup.key] || 0}
                </StatNumber>
              </Stat>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Today's Birthdays */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Today's Birthdays</Heading>
            <Checkbox
              isChecked={showBirthdayList}
              onChange={(e) => setShowBirthdayList(e.target.checked)}
            >
              Show list
            </Checkbox>
          </Flex>
        </CardHeader>
        <CardBody>
          {todayBirthdays.length > 0 ? (
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>DOB</Th>
                    <Th>Days until birthday</Th>
                    <Th>Age (Turns)</Th>
                    <Th>Gender</Th>
                    <Th>Ration number</Th>
                    <Th>Phone number</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {todayBirthdays.slice(0, 5).map((birthday) => {
                    const age = calculateAge(birthday.date_of_birth);
                    const daysUntil = birthday.days_until_birthday || 0;
                    return (
                      <Tr key={birthday.id}>
                        <Td>
                          {new Date(birthday.date_of_birth).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </Td>
                        <Td>
                          in {daysUntil}{" "}
                          {daysUntil === 0 ? "day (Today)" : "days"}
                        </Td>
                        <Td>{age}</Td>
                        <Td>{birthday.gender || "-"}</Td>
                        <Td>{birthday.household?.household_number || "-"}</Td>
                        <Td>{birthday.phone_number || "-"}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <Text color="gray.500">No birthdays today</Text>
          )}
        </CardBody>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Data Preview</Heading>
            <Button size="sm" onClick={() => navigate("/residents")}>
              View All
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>WARD NAME</Th>
                  <Th>RATION_CARD_NO</Th>
                  <Th>NO OF FAMILY MEMBERS</Th>
                  <Th>NAME OF THE PERSONS</Th>
                  <Th>ADDRESS</Th>
                  <Th>PH NO</Th>
                  <Th>AADHAR</Th>
                  <Th>GENDER</Th>
                  <Th>DOB</Th>
                </Tr>
              </Thead>
              <Tbody>
                {previewResidents.slice(0, 10).map((resident) => (
                  <Tr key={resident.id}>
                    <Td>
                      {resident.household?.ward_secretariat?.ward_name || "-"}
                    </Td>
                    <Td>{resident.household?.household_number || "-"}</Td>
                    <Td>{resident.household?.total_members || "-"}</Td>
                    <Td>
                      {[
                        resident.first_name,
                        resident.middle_name,
                        resident.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </Td>
                    <Td>{resident.household?.address_line1 || "-"}</Td>
                    <Td>{resident.phone_number || "-"}</Td>
                    <Td>-</Td>
                    <Td>{resident.gender || "-"}</Td>
                    <Td>
                      {resident.date_of_birth
                        ? new Date(resident.date_of_birth).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
