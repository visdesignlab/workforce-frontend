import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import Container from '@material-ui/core/Container';
import SimpleForm from './SimpleForm';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
	button: {
	justifyContent: 'center',
		display: 'flex'
    },
	  root: {
        justifyContent: 'center'
    },
	input: {
      display: 'none',
    },
});

function createData(name: string, author: string, description: string) {
  return { name, author, description };
}

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: '#91B4BA',
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

export default function SimpleTable(props:any) {
  const classes = useStyles();
  let isDone: boolean = true;
  const [count, setCount] = useState(0);


if (!count || count == 0) {
  return (
<Container fixed className={classes.root}>
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Model Name</StyledTableCell>
            <StyledTableCell align="left">Author</StyledTableCell>
            <StyledTableCell align="left">Description</StyledTableCell>
            <StyledTableCell align="left">Status</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.rows.map((row:any) => (
            <TableRow hover key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="left">{row.author}</TableCell>
              <TableCell align="left">{row.description}</TableCell>
              <TableCell align="left">{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
	  </TableContainer>
	   <div className={classes.button}>

      <label htmlFor="contained-button-file">
	  <Button
        variant="contained"
        color="default"
	  	component="span"
        startIcon={<CloudUploadIcon />}
		onClick={() => {
			isDone = false;
setCount(count + 1)
console.log( isDone)
		}}
      >
        Upload
      </Button>
      </label>
	  </div>
	  </Container>
  );
}
return (
<SimpleForm/>
);

}
