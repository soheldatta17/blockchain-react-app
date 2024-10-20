import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Grid,
  Snackbar,
} from '@mui/material';

function App() {
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  async function connectWallet() {
    if (!window.ethereum) {
      setSnackbarMessage("MetaMask is not installed. Please install MetaMask to use this feature.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const [selectedAccount] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(selectedAccount);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setSnackbarMessage("Failed to connect to MetaMask. " + getErrorMessage(error));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }

  async function sendTransaction() {
    if (!account || !recipient || !amount) {
      setSnackbarMessage("Please fill all the fields.");
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    try {
      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address.");
      }

      const parsedAmount = ethers.parseEther(amount);

      const tx = await signer.sendTransaction({
        to: recipient,
        value: parsedAmount,
      });

      await tx.wait();
      setSnackbarMessage(`Transaction successful! Hash: ${tx.hash}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Transaction error:", error);

      handleTransactionError(error);
    }
  }

  const handleTransactionError = (error) => {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      setSnackbarMessage("Transaction failed: Insufficient funds.");
    } else if (error.code === 'ACTION_REJECTED') {
      setSnackbarMessage("Transaction rejected by user.");
    } else if (error.message.includes("user denied")) {
      setSnackbarMessage("Transaction denied: User action required.");
    } else if (error.message.includes("Invalid recipient address")) {
      setSnackbarMessage("Transaction failed: Invalid recipient address.");
    } else if (error.message.includes("connection")) {
      setSnackbarMessage("Transaction failed: Connection issue.");
    } else {
      setSnackbarMessage("Transaction failed: " + error.message);
    }
    
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  }

  const getErrorMessage = (error) => {
    if (error.message) {
      return error.message;
    }
    return "An unknown error occurred.";
  }

  return (
    <Container maxWidth="sm" sx={{ marginTop: 5 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          ETH Buy/Sell Demo
        </Typography>
        
        {!account ? (
          <Button variant="contained" color="primary" onClick={connectWallet} fullWidth>
            Connect MetaMask
          </Button>
        ) : (
          <Box mt={2}>
            <Typography variant="h6" align="center" gutterBottom>
              Connected Account: {account}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Recipient Address"
                  variant="outlined"
                  fullWidth
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Amount in ETH"
                  variant="outlined"
                  fullWidth
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="secondary" onClick={sendTransaction} fullWidth>
                  Send ETH
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        severity={snackbarSeverity}
        action={
          <Button color="inherit" onClick={() => setSnackbarOpen(false)}>
            Close
          </Button>
        }
      />
    </Container>
  );
}

export default App;
