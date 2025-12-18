import { useState, Fragment } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';

const Navbar = ({ mainLinks, presaleLink, moreMenuLinks, comingSoonLink, handleClickContracts }) => {
  const { pathname } = useLocation();
  const [anchor, setAnchor] = useState(null);

  return (
    <Fragment>
      <Stack direction="row" spacing={1} alignItems="center">
        {mainLinks.map(link => (
          <Button key={link.href} component={NavLink} to={link.href} color="inherit" size="medium"
            sx={{ fontWeight: 400, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7585', '&:hover': { color: '#f0ece4' } }}
            className={({ isActive }) => isActive ? 'activeNavLink' : undefined} end
          >{link.label}</Button>
        ))}

        <Button component={NavLink} to={presaleLink.href} variant="contained" size="small"
          sx={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', px: 2, py: 0.8 }}
          className={({ isActive }) => isActive ? 'activeNavLink' : undefined} end
        >{presaleLink.label}</Button>

        {comingSoonLink.map(link => (
          <Button key={link} disabled size="medium" sx={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3d3a47 !important' }}>
            <Badge badgeContent={<span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em' }}>SOON</span>} color="primary">
              {link}
            </Badge>
          </Button>
        ))}

        <Button color="inherit" size="medium" onClick={e => setAnchor(e.currentTarget)}
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '14px !important' }} />}
          sx={{ fontWeight: 400, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#7a7585', '&:hover': { color: '#f0ece4' } }}
        >More</Button>
      </Stack>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}
        PaperProps={{ elevation: 0 }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {moreMenuLinks.map(link => (
          <MenuItem key={link.href} onClick={() => setAnchor(null)} component={Link} to={link.href} selected={pathname === link.href}>
            {link.label}
          </MenuItem>
        ))}
        <MenuItem component="a" href="" target="_blank" rel="noopener noreferrer" onClick={() => setAnchor(null)}>
          VTX Whitepaper
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); handleClickContracts(); }}>
          Contracts
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default Navbar;
