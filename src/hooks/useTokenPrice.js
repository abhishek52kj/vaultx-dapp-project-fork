/**
 * useTokenPrice
 * Fetches USD and native token price via the CoinGecko free API.
 * No API key required.  Falls back gracefully if the token isn't listed.
 */
import { getWrappedNative } from 'helpers/networks';
import { useCallback, useEffect, useState } from 'react';
import { c2, tokenValueTxt } from 'helpers/formatters';

const IsNative = (address) =>
  address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

/** Map hex chainId → CoinGecko platform id */
const COINGECKO_PLATFORM = {
  '0x1':  'ethereum',
  '0x38': 'binance-smart-chain',
  '0x89': 'polygon-pos',
};

const useTokenPrice = (options) => {
  const [tokenPrice, setTokenPrice] = useState(null);

  const fetchTokenPrice = useCallback(async (opts) => {
    if (!opts) return null;
    const { chain, address } = opts;

    const platform = COINGECKO_PLATFORM[chain];
    if (!platform) {
      console.warn(`useTokenPrice: CoinGecko platform not mapped for chain ${chain}`);
      return null;
    }

    const tokenAddress = IsNative(address) ? getWrappedNative(chain) : address;
    if (!tokenAddress) return null;

    try {
      const url =
        `https://api.coingecko.com/api/v3/simple/token_price/${platform}` +
        `?contract_addresses=${tokenAddress}&vs_currencies=usd,eth`;

      const res  = await fetch(url);
      const json = await res.json();
      const data = json[tokenAddress.toLowerCase()];
      if (!data) return null;

      const price = {
        usdPrice:    c2.format(data.usd ?? 0),
        nativePrice: tokenValueTxt(
          Math.round((data.eth ?? 0) * 1e18),
          18,
          'ETH',
        ),
      };
      setTokenPrice(price);
      return price;
    } catch (e) {
      console.error('useTokenPrice error:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    if (options) fetchTokenPrice(options);
  }, [options, fetchTokenPrice]);

  return { fetchTokenPrice, tokenPrice };
};

export default useTokenPrice;
