import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import CopyToClipboard from 'components/shared/CopyToClipboard.jsx';
import { getEllipsisTxt } from '../../helpers/formatters.js';
import { getExplorer } from '../../helpers/networks.js';
import { useWalletConnector } from './WalletConnector.jsx';

const resetLocalStorage = () => {
  localStorage.removeItem('wallet');
  localStorage.removeItem('connected');
};

const AccountDetails = ({ accountDetailsDialogOpen, handleAccountDetailsDialogToggle, data }) => {
  const { logoutWalletConnector } = useWalletConnector();

  const handleLogout = () => {
    logoutWalletConnector();
    handleAccountDetailsDialogToggle();
    resetLocalStorage();
  };

  const Row = ({ label, children }) => (
    <Box sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555062', mb: 0.75 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Dialog
      open={accountDetailsDialogOpen}
      onClose={handleAccountDetailsDialogToggle}
      BackdropProps={{ style: { backgroundColor: 'rgba(8,8,16,0.75)', backdropFilter: 'blur(6px)' } }}
      fullWidth maxWidth="xs"
    >
      {/* Gold top border */}
      <Box sx={{ height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '22px', fontWeight: 600, color: '#EDE9DF' }}>
              My Wallet
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#4eca8b', boxShadow: '0 0 6px #4eca8b' }} />
              <Typography sx={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: '#4eca8b', letterSpacing: '0.1em' }}>
                Connected
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleAccountDetailsDialogToggle} sx={{ color: '#555062', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: 34, height: 34, '&:hover': { color: '#EDE9DF', borderColor: 'rgba(255,255,255,0.2)' } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Row label="Address">
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Link
              href={`${getExplorer(data.chainId)}/address/${data.account}`}
              underline="none"
              target="_blank"
              rel="noreferrer"
              sx={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: '#C9A84C', '&:hover': { color: '#E2C87A' } }}
            >
              {getEllipsisTxt(data.account, 8)}
            </Link>
            <CopyToClipboard text={data.account} />
          </Stack>
        </Row>

        <Row label="ETH Balance">
          <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '26px', fontWeight: 600, color: '#EDE9DF' }}>
            {data.balance} <Box component="span" sx={{ fontSize: '14px', color: '#C9A84C' }}>ETH</Box>
          </Typography>
        </Row>
      </DialogContent>

      <DialogActions>
        <Button
          fullWidth
          startIcon={<LogoutIcon sx={{ fontSize: '14px !important' }} />}
          onClick={handleLogout}
          sx={{
            border: '1px solid rgba(224,92,92,0.25)',
            color: '#e05c5c',
            borderRadius: '8px',
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px', letterSpacing: '0.1em',
            py: 1.2,
            '&:hover': { background: 'rgba(224,92,92,0.08)', borderColor: 'rgba(224,92,92,0.5)' },
          }}
        >
          Disconnect Wallet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountDetails;
