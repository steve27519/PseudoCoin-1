import React from 'react';
import './Trade.css';
//import Invest from '../../components/Invest';
import API from '../../util/api';
import crypto from '../../util/crypto';

class Trade extends React.Component {
  state = {
    buyDollars: '',
    buyCoin: '',
    exCoinFrom: '',
    exCoinTo: '',
    exCoinAmount: '',
    options: [],
    holdings: [],
    buyErr: '',
    exErr: '',
    success: ''
  }
  componentDidMount() {
    this.loadOptions()
  }

  handleInputChange = event => {
    event.preventDefault();
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
    //console.log(value);
  };
  setBuyErr = (err) => {
    this.setState({
      buyErr: <p className="buyTradeErr">{err}</p>
    })
  }
  setSuccess = (yay) => {
    if (yay) {
      this.setState({
        success: <p className="success">Success!</p>
      })
    }
    else {
      this.setState({
        success: ''
      })
    }
  }

  buyCheck = (cb) => {
    this.setSuccess(false);
    if (!this.state.buyDollars || !this.state.buyCoin) {
      this.setBuyErr('Field is empty.')
      cb(false);
    }
    else if (Number.isNaN(Number.parseFloat(this.state.buyDollars))) {
      this.setBuyErr('Dollars must be a number.')
      cb(false)
    }
    else if (+this.state.buyDollars < 1) {
      this.setBuyErr('Must buy at least $1 of cryptocurrency.')
      cb(false)
    }
    else if (this.state.buyCoin.length > 5) {
      this.setBuyErr('Crypto ticker should be length 5 or less.')
      cb(false)
    }
    else {
      cb(true)
    }
  }

  handleBuy = event => {
    event.preventDefault();
    let buyCoin = this.state.buyCoin.toUpperCase();
    this.buyCheck(okay => {
      if (okay) {
        API.getCoins().then(coinData => {
          //console.log(coinData)
            var coinSaved = null;
            if (coinData.data.length) {
              coinSaved = coinData.data.find(coin => coin.symbol === buyCoin);
              //console.log('coinSaved:' + coinSaved.amount);
            }
            crypto.dollarsToCrypto(buyCoin, this.state.buyDollars, convertedAmount => {
              if (!coinSaved) {
                API.createCoin({
                  symbol: buyCoin, 
                  amount: +convertedAmount
                }).then(dbData => {
                  console.log('Coin created OK')
                  //console.log(dbData);
                  API.addDeposit({
                    amount: +this.state.buyDollars
                  }).then(dbData => {
                    console.log('Transaction OK')
                    //console.log(dbData)
                    this.setState({
                      buyDollars: '',
                      buyCoin: '',
                      buyErr: ''
                    })
                    this.setSuccess(true);

                  }).catch(err => {
                    console.log(err)
                  })            
                }).catch(err => console.log(err)); 
              }
              else {
                console.log('update coin amount: ')
                console.log(+(coinSaved.amount) + +convertedAmount)
                console.log('-------------')
                API.updateCoin(this.state.buyCoin, { 
                  amount: +(coinSaved.amount) + +convertedAmount
                }).then(dbData => {
                  console.log('Coin created OK')
                  //console.log(dbData);
                  API.addDeposit({
                    amount: +this.state.buyDollars
                  }).then(dbData => {
                    console.log('Transaction OK')
                    //console.log(dbData)
                    this.setState({
                      buyDollars: '',
                      buyCoin: '',
                      buyErr: ''
                    })
                    this.setSuccess(true)
                  }).catch(err => {
                    console.log(err)
                  })            
                }).catch(err => console.log(err));             
              }
              })
            
        }).catch(err => console.log(err))        
      }
    })
    
  }

  handleExchange = event => {
    event.preventDefault();
    console.log(this.state.exCoinFrom);
    console.log(this.state.exCoinAmount);
    console.log(this.state.exCoinTo);
    var coinAmt = 0;
    API.getCoins().then(coinData => {
      console.log(coinData);
      if (coinData.data.length) {
        coinAmt = coinData.data.find(coin => coin.symbol === this.state.exCoinFrom);
      }
      console.log(coinAmt)
      if (this.state.exCoinAmount && this.state.exCoinFrom && this.state.exCoinTo && +this.state.exCoinAmount>0 && +this.state.exCoinAmount < coinAmt) {
        crypto.amountFromTo({
          from: this.state.exCoinFrom,
          to: this.state.exCoinTo,
          amount: this.state.exCoinAmount
        }, convertedAmount => {
          if (coinData.data.find(coin => coin.symbol === this.state.exCoinTo)) {
            const original = +coinData.data.find(coin => coin.symbol === this.state.exCoinTo).amount;
            API.updateCoin(this.state.exCoinTo, {
              amount: +original + +convertedAmount
            }).then(dbData => {
              console.log('Update coin OK')
              console.log(dbData);
              API.updateCoin(this.state.exCoinFrom, {
                amount: +(+coinAmt - +this.state.exCoinAmount)
              }).then(dbData => {
                console.log('Trade OK')
                console.log(dbData);
                this.setState({
                  exCoinAmount: '',
                  exCoinFrom: '',
                  exCoinTo: ''
                })
                this.loadOptions();
              }).catch(err => {
                console.log(err)
              })              
            }).catch(err => {
              console.log(err)
            })
          }
          else {
            API.createCoin({
              symbol: this.state.exCoinFrom,
              amount: +convertedAmount
            }).then(dbData => {
              console.log('Create coin OK')
              console.log(dbData);
              API.updateCoin(this.state.exCoinFrom, {
                amount: +(+coinAmt - +this.state.exCoinAmount)
              }).then(dbData => {
                console.log('Trade OK')
                console.log(dbData);
                this.setState({
                  exCoinAmount: '',
                  exCoinFrom: '',
                  exCoinTo: ''
                })
                this.loadOptions()
              }).catch(err => {
                console.log(err)
              })              
            }).catch(err => {
              console.log(err)
            })
          }             
          })
        }
    }).catch(err => console.log(err));
  }
  handleExCoinFrom = (event) => {
    event.preventDefault();
    this.setState({
      exCoinFrom: event.target.value
    })
  }

  loadOptions = () => {
    API.getCoins().then(dbData => {
      if(dbData.data.length) {
        this.setState({
          options: dbData.data.map(coin => 
            <option value={coin.symbol}>{coin.symbol}: {coin.amount}</option>
          ),
          holdings: dbData.data.map(coin => <p>{coin.symbol}: {coin.amount}</p>)
        })
      }
      else {
        this.setState({
          options: <option>You do not have coins yet</option>,
          holdings: <p>You do not have coins yet</p>
        })
      }      
    }).catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item">
            <a className="nav-link active" id="buy-tab" data-toggle="tab" href="#buy" role="tab" aria-controls="buy" aria-selected="true">Buy</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" id="exchange-tab" data-toggle="tab" href="#exchange" role="tab" aria-controls="exchange" aria-selected="false">Trade</a>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent">
          <div className="tab-pane fade show active" id="buy" role="tabpanel"      aria-labelledby="buy-tab">
            <h4>Buy Cryptocurrency</h4>
            <p>Buy coins with virtual United States Dollars.</p> 
            <form>
              <div className="form-group">
                <label htmlFor="usdCurrency">Dollars</label>
                <input type="text" className="form-control" id="usdCurrency" aria-describedby="usdAmount" placeholder="Enter amount in $$"
                name="buyDollars" 
                value={this.state.buyDollars}
                onChange={this.handleInputChange} />
              </div>
              <div className="form-group">
                <label htmlFor="buyCurrency">Currency Name</label>
                <input type="text" className="form-control" id="buyCurrency" aria-describedby="currencyInput" placeholder="Enter symbol or name" 
                name="buyCoin"
                value={this.state.buyCoin}
                onChange={this.handleInputChange} />
              </div>
              {this.state.success}
              {this.state.buyErr}
              <button type="submit" onClick={this.handleBuy} className="btn btn-lg btn-primary">Submit</button>
            </form>
          </div>
          <div className="tab-pane fade" id="exchange" role="tabpanel"       aria-labelledby="exchange-tab">
            <h4>Exchange Cryptocurrency</h4>
            <p>Trade a cryptocurrency for a different cryptocurrency.</p>
            <div>
              <h5>Your Coins</h5>
              {this.state.holdings}
            </div>
            <form>
              <div className="form-group">
                <label htmlFor="coinSelectEx">Select a coin you own.</label>
                <select className="form-control" id="coinSelectEx" onChange={this.handleExCoinFrom}>
                  {this.state.options}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="usdCurrency">Amount to Trade</label>
                <input type="text" className="form-control" id="coinCurrency" aria-describedby="coinCurrency"
                name="exCoinAmount" 
                value={this.state.exCoinAmount}
                onChange={this.handleInputChange}/>
              </div>
              <div className="form-group">
                <label htmlFor="currency">Trade For: </label>
                <input type="text" className="form-control" id="currency" aria-describedby="currencyInput" placeholder="Enter symbol or name" 
                name="exCoinTo"
                value={this.state.exCoinTo}
                onChange={this.handleInputChange}/>
              </div>
              {this.state.success}
              {this.state.exErr}
              <button type="submit" onClick={this.handleExchange} className="btn btn-lg btn-primary">Submit</button>
            </form>
          </div>
        </div>            
      </div>
    )
  }
}

export default Trade;