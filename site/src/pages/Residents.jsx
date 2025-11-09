import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  HStack,
  VStack,
  Select,
  IconButton,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { residentsAPI } from "../utils/api";

const Residents = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [searchQuery, setSearchQuery] = useState(""); // Search functionality commented out
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState(null);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchResidents();
  }, [page, limit, sortField, sortOrder]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        sort: sortField,
        order: sortOrder,
        // ...(searchQuery && { q: searchQuery }), // Search functionality commented out
      };
      const response = await residentsAPI.getResidents(params);
      setResidents(response.data.data.residents);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch residents");
      console.error("Failed to fetch residents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Search functionality commented out
  // const handleSearch = (e) => {
  //   e.preventDefault();
  //   setPage(1); // Reset to first page on new search
  //   fetchResidents();
  // };

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1); // Reset to first page on sort change
  };

  const getSortIcon = (field) => {
    if (sortField === field) {
      // Show active sort direction
      return sortOrder === "asc" ? (
        <ChevronUpIcon color="blue.500" boxSize={4} />
      ) : (
        <ChevronDownIcon color="blue.500" boxSize={4} />
      );
    }
    // Show sortable indicator for non-active sortable columns
    return (
      <VStack spacing={0}>
        <ChevronUpIcon color="gray.400" boxSize={3} />
        <ChevronDownIcon color="gray.400" boxSize={3} />
      </VStack>
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "-";
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

  if (loading && !residents.length) {
    return (
      <Box
        p={8}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="60vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error && !residents.length) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={8} bg="gray.50">
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">All Residents</Heading>
        <Text color="gray.600">
          Total: {pagination?.total_residents || 0} residents
        </Text>
      </Flex>

      {/* Search Bar - Commented out */}
      {/* <Box mb={6}>
        <form onSubmit={handleSearch}>
          <Flex gap={2}>
            <Input
              placeholder="Search by name, resident ID, or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
            />
            <Button type="submit" colorScheme="blue">
              Search
            </Button>
            {searchQuery && (
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setPage(1);
                }}
                variant="outline"
              >
                Clear
              </Button>
            )}
          </Flex>
        </form>
      </Box> */}

      {/* Results per page */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack>
          <Text fontSize="sm">Show:</Text>
          <Select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            width="auto"
            size="sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
          <Text fontSize="sm">per page</Text>
        </HStack>
      </Flex>

      {/* Residents Table */}
      <TableContainer bg="white" borderRadius="md" boxShadow="sm">
        <Table variant="simple" size="md">
          <Thead bg="gray.100">
            <Tr>
              <Th>Ward Name</Th>
              <Th
                cursor="pointer"
                onClick={() => handleSort("first_name")}
                _hover={{ bg: "gray.200" }}
              >
                <HStack spacing={1}>
                  <Text>Name</Text>
                  {getSortIcon("first_name")}
                </HStack>
              </Th>
              <Th
                cursor="pointer"
                onClick={() => handleSort("date_of_birth")}
                _hover={{ bg: "gray.200" }}
              >
                <HStack spacing={1}>
                  <Text>Date of Birth</Text>
                  {getSortIcon("date_of_birth")}
                </HStack>
              </Th>
              <Th>Age</Th>
              <Th
                cursor="pointer"
                onClick={() => handleSort("gender")}
                _hover={{ bg: "gray.200" }}
              >
                <HStack spacing={1}>
                  <Text>Gender</Text>
                  {getSortIcon("gender")}
                </HStack>
              </Th>
              <Th>Phone Number</Th>
              <Th>Household Number</Th>
              <Th>Address</Th>
              <Th
                cursor="pointer"
                onClick={() => handleSort("occupation")}
                _hover={{ bg: "gray.200" }}
              >
                <HStack spacing={1}>
                  <Text>Occupation</Text>
                  {getSortIcon("occupation")}
                </HStack>
              </Th>
              <Th
                cursor="pointer"
                onClick={() => handleSort("caste")}
                _hover={{ bg: "gray.200" }}
              >
                <HStack spacing={1}>
                  <Text>Caste</Text>
                  {getSortIcon("caste")}
                </HStack>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {residents.length === 0 ? (
              <Tr>
                <Td colSpan={10} textAlign="center" py={8}>
                  <Text color="gray.500">No residents found</Text>
                </Td>
              </Tr>
            ) : (
              residents.map((resident) => (
                <Tr key={resident.id}>
                  <Td>
                    {resident.household?.ward_secretariat?.ward_name || "-"}
                  </Td>
                  <Td>
                    {[
                      resident.first_name,
                      resident.middle_name,
                      resident.last_name,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </Td>
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
                  <Td>{calculateAge(resident.date_of_birth)}</Td>
                  <Td>{resident.gender || "-"}</Td>
                  <Td>{resident.phone_number || "-"}</Td>
                  <Td>{resident.household?.household_number || "-"}</Td>
                  <Td>{resident.household?.address_line1 || "-"}</Td>
                  <Td>{resident.occupation || "-"}</Td>
                  <Td>{resident.caste || "-"}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <Flex justify="space-between" align="center" mt={6}>
          <Text fontSize="sm" color="gray.600">
            Page {pagination.current_page} of {pagination.total_pages}
          </Text>
          <HStack>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => handlePageChange(page - 1)}
              isDisabled={!pagination.has_prev_page}
              aria-label="Previous page"
            />
            <Text fontSize="sm">
              {pagination.current_page} / {pagination.total_pages}
            </Text>
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => handlePageChange(page + 1)}
              isDisabled={!pagination.has_next_page}
              aria-label="Next page"
            />
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default Residents;
