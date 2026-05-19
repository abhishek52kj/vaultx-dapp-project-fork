import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';

import Home from './containers/home';
import About from './containers/about';
import Gallery from './containers/gallery';
import Transactions from './containers/transactions';
import NFTs from './containers/nfts';
import Swap from './containers/swap';
import Presale from './containers/pre-sale';
import Mint from './containers/mint';
import Stake from './containers/stake';
import Ramper from './components/Ramper';
import ERC20Balance from './components/ERC20Balance';

import Footer from './components/layout/Footer';
import MainNavigation from './components/layout/Header/MainNavigation';
import ParticleCanvas from './components/ui/ParticleCanvas';
import { useWalletLifecycle } from './components/account/WalletConnector';

import 'antd/dist/reset.css';

const App = () => {
  const { library, account } = useWeb3React();
  useWalletLifecycle();

  useEffect(() => {
    if (library && account) localStorage.setItem('connected', true);
  }, [library, account]);

  return (
    <BrowserRouter>
        <ParticleCanvas />
        <div className="scanlines"/>
        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <MainNavigation />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/erc20balance" element={<ERC20Balance />} />
              <Route path="/onramp" element={<Ramper />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/nfts" element={<NFTs />} />
              <Route path="/pre-sale" element={<Presale />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/stake" element={<Stake />} />
            </Routes>
          </main>
          <Footer />
        </div>
    </BrowserRouter>
  );
};

export default App;
