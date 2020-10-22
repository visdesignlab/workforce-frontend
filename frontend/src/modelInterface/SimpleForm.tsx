import React, {FC, useState, ChangeEvent, useEffect} from 'react';
import Button from '@material-ui/core/Button';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import {ModelConfig, getDefaultModelConfig} from './ModelConfig';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import axios from 'axios';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';



const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    root: {
      display: 'flex',
    },
  }),
);

const useStylesPopover = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  }
}));

const removedProfessions = new Set();
const SimpleForm = () => {
  const classes = useStyles();
  const [count, setCount] = useState(0);
  const [di, setDi] = useState<ModelConfig>(getDefaultModelConfig());
  const [firstError, setFirstError] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const professions = ["RN", "Psych", "Phys", "PharmD", "PA", "NP", "MFT", "MA", "LCSW", "Educ", "CMHC"];

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      removedProfessions.add(event.target.name);
    } else {
      removedProfessions.delete(event.target.name);
    }
  };

  const email = di.email;
  const handleFormSubmission = (info: ModelConfig) => {
    const formData = new FormData();

    formData.append('file', info.file);
let arr = Array.from(removedProfessions) as string[];
    //info.removedProfessions = arr as string[];
    di.removedProfessions = arr;
    formData.append('metadata', JSON.stringify(info));

    axios
      .post(`${process.env.API_ROOT}/file-upload`, formData)
      .then(() => {
		alert('Uploaded successfully!')
      })
      .catch(err => {
        console.error(err);
      });
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    handleFormSubmission(di);
    setCount(0)
  };

  // Popover logic
  const classesPopover = useStylesPopover();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <Grid container justify="center" alignItems="center">
      <form style={{display: 'table'}} onSubmit={handleSubmit}>
        <Grid container justify="center" alignItems="center">
		<Grid style={{width: '75%'}} container spacing={5}>
		<Grid item xs={12} sm={4}>
		<div>

		<input
		style={{display:"none"}}
		accept="*"
		id="contained-button-file"
		multiple
		onChange={(event) => {
                  setDi({...di, file: event.target.files[0]});
		}}
		type="file"
		/>
		<label htmlFor="contained-button-file">
		<Button
		variant="contained"
		color="default"
		component="span"
		startIcon={<CloudUploadIcon />}
		>
			Choose
			</Button>
			</label>
			</div>
			</Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                onChange={(event: ChangeEvent<{value: string}>) => {
                  setDi({...di, modelname: event.target.value});
                }}
                value={di.modelname}
                required
                id="name"
                name="name"
                label="Model Name"
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                onChange={(event: ChangeEvent<{value: string}>) => {
                  setDi({...di, from: event.target.value});
                }}
				required
                id="from"
                name="from"
                label="From"
                variant="outlined"
				type="number"
				placeholder="2019"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                onChange={(event: ChangeEvent<{value: string}>) => {
                  setDi({...di, to: event.target.value});
                }}
				required
                id="to"
                name="to"
                label="To"
                variant="outlined"
				type="number"
				placeholder="2029"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                onChange={(event: ChangeEvent<{value: string}>) => {
                  setDi({...di, stepSize: event.target.value});
                }}
				required
                id="interval"
                name="interval"
                label="Interval"
                variant="outlined"
				type="number"
				placeholder="5"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Model</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          onChange={(event) => {
            setDi({...di, model: String(event.target.value)});
          }}
          value={di.model}
        >
          <MenuItem value={"ideal_staffing"}>Ideal Staffing</MenuItem>
          <MenuItem value={"service_allocation"}>Service Allocation</MenuItem>
        </Select>
      </FormControl>
            </Grid>
            <Grid item xs={12}>
<div className={classes.root}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Professions</FormLabel>
        <FormGroup row key={'daffa'}>
{professions.map((prof, i) => (
          <FormControlLabel
            control={<Checkbox defaultChecked={true} onChange={handleChange} name={prof} />}
            label={prof}
            key={prof}
          />
    ))}
        </FormGroup>
      </FormControl>
    </div>
            </Grid>
            <Grid item xs={12}>
              <TextField
                onChange={(event: ChangeEvent<{value: string}>) => {
                  setDi({...di, description: event.target.value});
                }}
                value={di.description}
                id="description"
                name="description"
                label="Description"
                variant="outlined"
                placeholder="Please describe the dataset"
                multiline
                rows="4"
                fullWidth></TextField>
            </Grid>
            <Grid container item xs={12} justify="center">
              <Button
				style={{background: '#91B4BA'}}
                disabled={false}
                type="submit"
                variant="contained">
                Submit
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
      

      <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick} className={classesPopover.button}>
        Click for help
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
      <Typography className={classesPopover.typography}>
        File Upload: The data file that the model will use to compute supply and needs. <br /> 
        Model Name: A descriptive name for your model. <br />
        From: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  <br />
        To: Currently, one of: 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024.  <br />
        Interval: The step size for the model in years. This should be 1 or 2.  <br />
        Model Type: One of: "ideal_staffing", "ideal_staffing_current", or "service_allocation".  <br />
        Professions: List of professions to include.<br />
        Description: A longer form description to describe your data and goals. <br />
      </Typography>
      </Popover>
    </Grid>
  );
};

export default SimpleForm;
