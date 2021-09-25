import node_geocoder from 'node-geocoder';

const options = {
  provider: 'mapquest',
  httpAdapter: 'https',
  apiKey: '0g93yIzo9ZtrGAFhbeuZqy1Ls4oJUpOI',
  formatter: null,
};

const geocoder = node_geocoder(options);

export default geocoder;
