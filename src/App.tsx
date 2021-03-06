import React, { useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import {
  CircularProgress,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  Paper,
  Grid,
  TextField,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";

import { Prediction, RibbonResponse, isGooglePrediction } from './types/';

const searchBaseUrl = 'https://doctor-search-api.jasonleibowitz.now.sh/google-doctors';
const detailBaseUrl = 'https://doctor-search-api.jasonleibowitz.now.sh/place-detail';
const ribbonBaseUrl = 'https://doctor-search-api.jasonleibowitz.now.sh/ribbon-search';

const App = () => {
  const [open, setOpen] = useState(false);
  const [predictions, updatePredictions] = useState([]);
  const [isLoading, updateIsLoading] = useState(false);
  const handleInputChange = async (event: object, value: string, reason: string) => {
    const isGoogle = searchType === 'google';
    updateIsLoading(true);

    if (reason === 'clear') {
      updateSelectedOption(null);
    } else {
      try {
        const url = isGoogle ? `${searchBaseUrl}?s=${value}&l=${searchLocation}` : `${ribbonBaseUrl}?s=${value}&l=${searchLocation}`;
        const results = await axios.get(url);
        if (results.status === 200) {
          let predictions = [];
          if (isGoogle) {
            predictions = results.data;
          } else {
            predictions = results.data.data
          }
          updatePredictions(predictions);
          updateIsLoading(false);
        } else {
          // handle non 200 case
          updateIsLoading(false);
        }
      } catch (err) {
        // handle error case
        updateIsLoading(false);
      }
    }
  };

  const [searchType, updateSearchType] = useState('google');
  const handleSearchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchType((event.target as HTMLInputElement).value);
  };

  const [searchLocation, updateSearchLocation] = useState();
  const handleUpdateSearchLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateSearchLocation((event.target as HTMLInputElement).value);
  }

  const [selectedOption, updateSelectedOption] = useState();
  // @ts-ignore
  const handleOptionClicked = async (option) => {
    const placeId = option?.place_id;
    if (placeId) {
      const detailResult = await axios.get(`${detailBaseUrl}?placeId=${placeId}`);
      const {
        formatted_address,
        formatted_phone_number,
        name,
      } = detailResult.data.result;
      updateSelectedOption({ name, address: formatted_address, phone: formatted_phone_number });
    } else {
      const {
        first_name,
        last_name,
        locations,
      } = option;
      updateSelectedOption({ name: `${first_name} ${last_name}`, address: locations[0]?.address, phone: locations[0]?.phone_numbers[0]?.phone });
    }
  };

  const handleGetOptionLabel = (option: Prediction | RibbonResponse) => {
    if (isGooglePrediction(option)) {
      return option && option.description
    } else {
      return option && `${option.first_name} ${option.last_name} - ${option.specialties[0].board_specialty}`
    }
  }
      
  const handleRenderOption = (option: Prediction | RibbonResponse) => {
    if (isGooglePrediction(option)) {
      return option && (
        <Grid container alignItems="center">
          <Grid item>
            <Grid onClick={() => handleOptionClicked(option)} item xs>
              <span style={{ fontWeight: 700 }}>
                {option.description}
              </span>
              <Typography variant="body2" color="textSecondary">
                {option.types[0]}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      );
    } else {
      return option && (
        <Grid container alignItems="center">
          <Grid item>
            <Grid onClick={() => handleOptionClicked(option)} item xs>
              <span style={{ fontWeight: 700 }}>
                {`${option.first_name} ${option.last_name}`}
              </span>
              <Typography variant="body2" color="textSecondary">
                {option.specialties[0].display} - {option.locations[0].address_details.city}, {option.locations[0].address_details.state}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      );
    }
  }
            

  const loading = open && isLoading;

  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={10}>
        <Typography component="h1" variant="h1" align="center">
          Vinay's Super Fancy Doctor Search POC
        </Typography>
      </Grid>
      <Grid item xs={10}>
        <Paper style={{ padding: 50 }}>
          <FormControl component="fieldset">
            <RadioGroup
              name="search-type"
              value={searchType}
              onChange={handleSearchTypeChange}
              style={{ flexDirection: "row" }}
            >
              <FormControlLabel
                value="google"
                control={<Radio />}
                label="Google"
              />
              <FormControlLabel
                value="ribbon"
                control={<Radio />}
                label="Ribbon"
              />
            </RadioGroup>
          </FormControl>

          <TextField
            value={searchLocation}
            label="Location"
            onChange={handleUpdateSearchLocation}
            style={{ width: "100%", marginBottom: 50 }}
          />

          <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            loading={loading}
            autoComplete={true}
            autoHighlight={true}
            onInputChange={_.debounce(handleInputChange, 300)}
            options={predictions}
            getOptionLabel={handleGetOptionLabel}
            renderInput={params => (
              <TextField
                {...params}
                label="Type in Your Doctor's Name"
                variant="outlined"
                fullWidth={true}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={handleRenderOption}
          />
        </Paper>
      </Grid>
      {selectedOption && (
        <Paper style={{ padding: 20, marginTop: 50 }}>
          <h3>Selected Physician</h3>
          <p><b>Name</b>: {selectedOption.name}</p>
          <p><b>Address</b>: {selectedOption.address}</p>
          <p><b>Phone</b>: {selectedOption.phone}</p>
        </Paper>
      )}
    </Grid>
  );
}

export default App;
