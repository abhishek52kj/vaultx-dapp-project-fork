import { Fragment, useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import AccountDetails from './AccountDetails';
import { getEllipsisTxt } from '../../helpers/formatters';
import { ethers } from 'ethers';

const Authenticated = ({ library, account }) => {
  const [balance, setBalance]                     = useState('');
  const [chainId, setChainId]                     = useState(0);
  const [accountDetailsOpen, setAccountDetailsOpen] = useState(false);

  useEffect(() => {
    if (!library) return;
    library.getBalance(account).then(bal =>
      setBalance(parseFloat(ethers.utils.formatUnits(bal, 18)).toFixed(4))
    );
    if (library.provider) setChainId(library.provider.chainId);
  }, [library, account]);

  return (
    <Fragment>
      {/* Balance badge */}
      <Box sx={{
        display: { xs: 'none', sm: 'flex' },
        alignItems: 'center',
        gap: 0.75,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '7px',
        px: 1.8, py: 0.8,
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#4eca8b', boxShadow: '0 0 6px #4eca8b' }} />
        <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#C9A84C', fontWeight: 500 }}>
          {balance} ETH
        </Typography>
      </Box>

      {/* Address chip */}
      <Chip
        label={getEllipsisTxt(account, 5)}
        onClick={() => setAccountDetailsOpen(true)}
        sx={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px', fontWeight: 600,
          letterSpacing: '0.06em',
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.25)',
          color: '#C9A84C',
          borderRadius: '7px',
          height: '34px',
          cursor: 'pointer',
          '&:hover': { background: 'rgba(201,168,76,0.15)', borderColor: 'rgba(201,168,76,0.5)' },
        }}
      />

      <AccountDetails
        accountDetailsDialogOpen={accountDetailsOpen}
        handleAccountDetailsDialogToggle={() => setAccountDetailsOpen(false)}
        data={{ balance, account, chainId }}
      />
    </Fragment>
  );
};

export default Authenticated;
