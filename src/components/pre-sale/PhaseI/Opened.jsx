import { useState, useEffect, Fragment } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import PRESALE_ABI from '../../../contracts/presale.json';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '../../ui/Alert';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import moment from 'moment';

const PRESALE_CONTRACT = ['', '0xBb569C738f56348B21a84D520f679fe41Fd01cc5'];
let chainIdx = 0;
const NET_IDS = [0x3, 0x61];

const StatRow = ({ label, value, highlight }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center"
    sx={{ py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '12px', color: '#6b6880' }}>{label}</Typography>
    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '12px', color: highlight ? '#c8a951' : '#b8b3ab', fontWeight: highlight ? 600 : 400, textAlign: 'right', maxWidth: '55%', wordBreak: 'break-all' }}>{value}</Typography>
  </Stack>
);

const SLabel = ({ children }) => (
  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#c8a951', fontWeight: 600, mt: 3, mb: 1.5 }}>
    {children}
  </Typography>
);

const Opened = () => {
  const [amount, setAmount]             = useState(1);
  const [vtxOut, setVtxOut]             = useState('');
  const [tokenInfo, setTokenInfo]       = useState([]);
  const [presaleInfo, setPresaleInfo]   = useState([]);
  const [buyerInfo, setBuyerInfo]       = useState([]);
  const [status, setStatus]             = useState([]);
  const [presaleState, setPresaleState] = useState('');
  const [alertMsg, setAlertMsg]         = useState('');
  const [openAlert, setOpenAlert]       = useState(false);
  const [raised, setRaised]             = useState(0);
  const [hardcap, setHardcap]           = useState(0);
  const [rate, setRate]                 = useState(2000000);

  const { account, library } = useWeb3React();

  useEffect(() => {
    if (!library?.provider) { reset(); return; }
    const id = parseInt(library.provider.chainId);
    if      (id === NET_IDS[0]) { chainIdx = 0; getInfo(); }
    else if (id === NET_IDS[1]) { chainIdx = 1; getInfo(); }
    else showAlert('Unrecognized chain');
  }, [account, library]);

  useEffect(() => {
    const v = parseFloat(amount) || 0;
    setVtxOut(v > 0 ? (v * rate).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '');
  }, [amount, rate]);

  const reset = () => { setAmount(1); setTokenInfo([]); setPresaleInfo([]); setStatus([]); setBuyerInfo([]); setPresaleState(''); };
  const showAlert = (msg) => { setOpenAlert(true); setAlertMsg(msg); };
  const getContract = (abi, addr, signer) => new ethers.Contract(addr, abi, signer);

  const getInfo = async () => {
    if (!account) { showAlert('Connect your wallet'); return; }
    const signer = await library.getSigner();
    const c = getContract(PRESALE_ABI, PRESALE_CONTRACT[chainIdx], signer);
    const sym = parseInt(library.provider.chainId) === NET_IDS[0] ? 'ETH' : 'BNB';
    try {
      const r = await c.token_rate(); setRate(parseInt(r));
      const info = await c.presale_info();
      const hc = parseFloat(ethers.utils.formatUnits(info.hardcap, 18));
      setHardcap(hc);
      setPresaleInfo([
        { id: 'Token Rate',     val: `${parseInt(r).toLocaleString()} VTX / ${sym}` },
        { id: 'Soft Cap',       val: `${ethers.utils.formatUnits(info.softcap, 18)} ${sym}` },
        { id: 'Hard Cap',       val: `${hc} ${sym}`, highlight: true },
        { id: 'Min per wallet', val: `${ethers.utils.formatUnits(info.raise_min, 18)} ${sym}` },
        { id: 'Max per wallet', val: `${ethers.utils.formatUnits(info.raise_max, 18)} ${sym}` },
        { id: 'Start',          val: moment.utc(parseInt(info.soft_start)*1000).format('Do MMM YYYY, h A') + ' UTC' },
        { id: 'End',            val: moment.utc(parseInt(info.soft_end)*1000).format('Do MMM YYYY, h A') + ' UTC' },
      ]);
    } catch { showAlert('Error loading presale config'); return; }
    try {
      const ti = await c.tokeninfo();
      setTokenInfo([
        { id: 'Token Name', val: ti.name },
        { id: 'Symbol',     val: ti.symbol, highlight: true },
        { id: 'Decimals',   val: parseInt(ti.decimal) },
        { id: 'Address',    val: info ? ti.name : '—' },
        { id: 'Sale Supply',val: `${((parseFloat(ethers.utils.formatUnits(ti.totalsupply, ti.decimal)) / 100) * 10).toLocaleString()} VTX` },
      ]);
    } catch { showAlert('Error loading token info'); return; }
    try {
      const st = await c.status();
      const ti2 = await c.tokeninfo();
      const ra = parseFloat(ethers.utils.formatUnits(st.raised_amount, 18));
      setRaised(ra);
      setStatus([
        { id: 'Total Raised', val: `${ra.toFixed(4)} ${sym}`, highlight: true },
        { id: 'VTX Sold',     val: `${parseFloat(ethers.utils.formatUnits(st.sold_amount, ti2.decimal)).toLocaleString()} VTX` },
        { id: 'Participants', val: parseInt(st.num_buyers).toString() },
      ]);
    } catch { showAlert('Error loading status'); return; }
    try {
      const bi = await c.buyers(account);
      const ti3 = await c.tokeninfo();
      setBuyerInfo([
        { id: 'Your Investment', val: `${parseFloat(ethers.utils.formatUnits(bi.base, 18)).toFixed(4)} ${sym}`, highlight: true },
        { id: 'Your VTX',        val: `${parseFloat(ethers.utils.formatUnits(bi.sale, 18)).toLocaleString()} VTX`, highlight: true },
      ]);
    } catch { }
    try {
      const state = parseInt(await c.presaleStatus());
      const map = { 1: 'Public Presale Active', 2: 'Stopped', 3: 'Soft Presale Active', 4: 'Success', 5: 'Failed' };
      setPresaleState(map[state] || 'Unknown');
    } catch { }
  };

  const exec = async (fn) => {
    if (!account) { showAlert('Connect your wallet'); return; }
    const signer = await library.getSigner();
    const c = getContract(PRESALE_ABI, PRESALE_CONTRACT[chainIdx], signer);
    try { await fn(c); showAlert('Transaction submitted'); getInfo(); }
    catch { showAlert('Transaction failed'); }
  };

  const handleAction = () => {
    if (['Soft Presale Active','Public Presale Active'].includes(presaleState))
      exec(c => c.userDeposit({ value: ethers.utils.parseUnits(String(amount), 18) }));
    else if (presaleState === 'Success') exec(c => c.userWithdrawTokens());
    else if (presaleState === 'Failed')  exec(c => c.userWithdrawBaseTokens());
  };

  const progressPct = hardcap > 0 ? Math.min((raised / hardcap) * 100, 100) : 0;
  const stateColor  = ['Success','Soft Presale Active','Public Presale Active'].includes(presaleState) ? 'success' : presaleState === 'Failed' ? 'error' : 'default';
  const actionLabel = ['Soft Presale Active','Public Presale Active'].includes(presaleState) ? 'Buy VTX' : presaleState === 'Success' ? 'Claim VTX' : presaleState === 'Failed' ? 'Withdraw ETH' : null;
  const isActive    = ['Soft Presale Active','Public Presale Active'].includes(presaleState);

  return (
    <Fragment>
      <Alert openAlert={openAlert} setOpenAlert={setOpenAlert} msg={alertMsg} />

      <Grid container spacing={3} justifyContent="center" className="fadeInUp">
        {/* Main card */}
        <Grid item xs={12} md={8} lg={7}>
          <Card sx={{ borderRadius: '20px', overflow: 'visible', position: 'relative' }}>
            {/* Gold top border */}
            <Box sx={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,169,81,0.5), transparent)' }} />

            <CardContent sx={{ p: { xs: '28px', md: '40px' } }}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontSize: '24px', color: '#eeeae0', mb: 0.25 }}>VTX Presale</Typography>
                  <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '12px', color: '#6b6880' }}>Fixed Rate · Round 1</Typography>
                </Box>
                {presaleState && <Chip label={presaleState} color={stateColor} size="small" />}
              </Stack>

              {/* Progress */}
              {hardcap > 0 && (
                <Box sx={{ mb: 4, p: '20px', borderRadius: '12px', background: 'rgba(200,169,81,0.04)', border: '1px solid rgba(200,169,81,0.12)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" mb={1.5}>
                    <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '26px', color: '#c8a951', fontWeight: 700 }}>
                      {raised.toFixed(3)} ETH
                    </Typography>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '12px', color: '#6b6880' }}>
                      of {hardcap} ETH hard cap
                    </Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={progressPct} sx={{ mb: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '11px', color: '#c8a951' }}>{progressPct.toFixed(1)}% filled</Typography>
                    <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '11px', color: '#302e3c' }}>{(hardcap-raised).toFixed(2)} ETH remaining</Typography>
                  </Stack>
                </Box>
              )}

              {/* Rate box */}
              <Box sx={{ mb: 4, p: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '12px', color: '#6b6880' }}>Current Rate</Typography>
                <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: '18px', color: '#c8a951', fontWeight: 600 }}>
                  1 ETH = {rate.toLocaleString()} VTX
                </Typography>
              </Box>

              {/* Buy input */}
              {isActive && (
                <Box sx={{ mb: 4 }}>
                  <SLabel>You send</SLabel>
                  <TextField fullWidth value={amount} onChange={e => setAmount(e.target.value)} type="number"
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '13px', color: '#6b6880' }}>ETH</Typography></InputAdornment> }}
                    sx={{ mb: 1.5 }} />
                  <SLabel>You receive</SLabel>
                  <TextField fullWidth value={vtxOut} readOnly
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontFamily: '"Syne", sans-serif', fontSize: '13px', color: '#c8a951' }}>VTX</Typography></InputAdornment>, readOnly: true }} />
                </Box>
              )}

              {/* Action button */}
              {actionLabel && (
                <Button fullWidth variant="contained" size="large" onClick={handleAction}
                  sx={{ fontSize: '15px', fontWeight: 700, py: 1.8, mb: 4, letterSpacing: '0.03em' }}>
                  {actionLabel}
                </Button>
              )}

              {/* Data sections */}
              {tokenInfo.length > 0 && (
                <><SLabel>Token Information</SLabel>{tokenInfo.map((r,i) => <StatRow key={i} label={r.id} value={r.val} highlight={r.highlight} />)}</>
              )}
              {presaleInfo.length > 0 && (
                <><SLabel>Presale Configuration</SLabel>{presaleInfo.map((r,i) => <StatRow key={i} label={r.id} value={r.val} highlight={r.highlight} />)}</>
              )}
              {status.length > 0 && (
                <><SLabel>Live Status</SLabel>{status.map((r,i) => <StatRow key={i} label={r.id} value={r.val} highlight={r.highlight} />)}</>
              )}
              {buyerInfo.length > 0 && (
                <><SLabel>Your Position</SLabel>{buyerInfo.map((r,i) => <StatRow key={i} label={r.id} value={r.val} highlight={r.highlight} />)}</>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default Opened;
