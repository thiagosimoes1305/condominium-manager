import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material';
import { gql } from '@apollo/client';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    // Adjust for timezone offset and format
    const adjustedDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );
    
    return adjustedDate.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Invalid date';
  }
};

const GET_APARTMENT_OWNERS = gql`
  query GetApartmentOwners {
    apartmentOwners {
      id
      name
      email
      apartmentNumber
      building {
        id
        name
      }
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const GET_BUILDINGS = gql`
  query GetBuildings {
    buildings {
      id
      name
    }
  }
`;

const GET_OWNERS_BY_BUILDING = gql`
  query GetOwnersByBuilding($buildingId: ID!) {
    apartmentOwnersByBuilding(buildingId: $buildingId) {
      id
      name
      email
      apartmentNumber
      building {
        id
        name
      }
      phoneNumber
      createdAt
      updatedAt
    }
  }
`;

const CREATE_APARTMENT_OWNER = gql`
  mutation CreateApartmentOwner($input: CreateApartmentOwnerInput!) {
    createApartmentOwner(input: $input) {
      id
      name
      email
      apartmentNumber
      phoneNumber
      createdAt
    }
  }
`;

const UPDATE_APARTMENT_OWNER = gql`
  mutation UpdateApartmentOwner($id: ID!, $input: UpdateApartmentOwnerInput!) {
    updateApartmentOwner(id: $id, input: $input) {
      id
      name
      email
      apartmentNumber
      phoneNumber
      updatedAt
    }
  }
`;

const DELETE_APARTMENT_OWNER = gql`
  mutation DeleteApartmentOwner($id: ID!) {
    deleteApartmentOwner(id: $id)
  }
`;

interface Building {
  id: string;
  name: string;
}

interface ApartmentOwner {
  id: string;
  name: string;
  email: string;
  apartmentNumber: string;
  buildingId?: string;
  building?: Building;
  getBuildingId?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface ApartmentOwnerFormData {
  name: string;
  email: string;
  apartmentNumber: string;
  buildingId: string;
  getBuildingId: string;
  phoneNumber: string;
}

const ApartmentOwners: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOwner, setEditingOwner] = useState<ApartmentOwner | null>(null);
  const [formData, setFormData] = useState<ApartmentOwnerFormData>({
    name: '',
    email: '',
    apartmentNumber: '',
    buildingId: '',
    getBuildingId: '',
    phoneNumber: '',
  });

  const { data: allOwnersData, error: errorAllOwners, loading: loadingAllOwners, refetch: refetchAllOwners } = useQuery(GET_APARTMENT_OWNERS);
  const { data: buildingsData } = useQuery(GET_BUILDINGS);

  const { data: filteredOwnersData, loading: loadingFiltered } = useQuery(GET_OWNERS_BY_BUILDING, {
    variables: { buildingId: formData.buildingId },
    skip: !formData.buildingId,
  });

  const [createOwner] = useMutation(CREATE_APARTMENT_OWNER);
  const [updateOwner] = useMutation(UPDATE_APARTMENT_OWNER);
  const [deleteOwner] = useMutation(DELETE_APARTMENT_OWNER);

  const owners = formData.buildingId
    ? filteredOwnersData?.apartmentOwnersByBuilding
    : allOwnersData?.apartmentOwners;

  const loading = formData.buildingId ? loadingFiltered : loadingAllOwners;

  const handleOpenDialog = (owner?: ApartmentOwner) => {
    if (owner) {
      setEditingOwner(owner);
      setFormData({
        name: owner.name,
        email: owner.email,
        apartmentNumber: owner.apartmentNumber,
        buildingId: owner.buildingId || '',
        getBuildingId: owner.getBuildingId || '',
        phoneNumber: owner.phoneNumber || '',
      });
    } else {
      setEditingOwner(null);
      setFormData({
        name: '',
        email: '',
        apartmentNumber: '',
        buildingId: '',
        getBuildingId: '',
        phoneNumber: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOwner(null);
    setFormData({
      name: '',
      email: '',
      apartmentNumber: '',
      buildingId: '',
      getBuildingId: '',
      phoneNumber: '',
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingOwner) {
        await updateOwner({
          variables: {
            id: editingOwner.id,
            input: formData,
          },
        });
      } else {
        await createOwner({
          variables: {
            input: formData,
          },
        });
      }
      refetchAllOwners();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving apartment owner:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this apartment owner?')) {
      try {
        await deleteOwner({
          variables: { id },
        });
        refetchAllOwners();
      } catch (error) {
        console.error('Error deleting apartment owner:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (errorAllOwners) {
    return (
      <Alert severity="error">
        Error loading apartment owners: {errorAllOwners.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <Typography variant="h4">Apartment Owners</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by</InputLabel>
              <Select
                value={formData.buildingId}
                label="Filter by"
                onChange={(e: SelectChangeEvent) =>
                  setFormData((prev) => ({ ...prev, buildingId: e.target.value }))
                }
              >
                <MenuItem value="">
                  <em>All buildings</em>
                </MenuItem>
                {buildingsData?.buildings.map((building: Building) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" justifyContent={{ xs: 'center', md: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Owner
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {owners?.map((owner: ApartmentOwner) => (
          <Grid item xs={12} sm={6} md={4} key={owner.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {owner.name}
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {owner.email}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Apartment {owner.apartmentNumber}
                  </Typography>
                </Box>
                {owner.building && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <ApartmentIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {owner.building.name}
                    </Typography>
                  </Box>
                )}
                {owner.phoneNumber && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {owner.phoneNumber}
                    </Typography>
                  </Box>
                )}
                <Typography variant="caption" color="textSecondary">
                  Created: {formatDate(owner.createdAt)}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(owner)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(owner.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOwner ? 'Edit Apartment Owner' : 'Add New Apartment Owner'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Apartment Number"
                value={formData.apartmentNumber}
                onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Building</InputLabel>
                <Select
                  value={formData.buildingId}
                  label="Building"
                  onChange={(e: SelectChangeEvent) => setFormData({ ...formData, buildingId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>No building assigned</em>
                  </MenuItem>
                  {buildingsData?.buildings.map((building: Building) => (
                    <MenuItem key={building.id} value={building.id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOwner ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApartmentOwners; 