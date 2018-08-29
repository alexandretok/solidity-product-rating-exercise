import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import rating from './rating';

class App extends Component {
  state = {
    owner: '',
    products: [],
    newProductName: '',
    accounts: '',
    status: ''
  };

  async componentDidMount() {
    this.setState({accounts: await web3.eth.getAccounts()});
    this.setState({owner: await rating.methods.owner().call()});

    const productCount = await rating.methods.productCount().call();
    let products = [];
    for(let i = 0; i < productCount; i++) {
      let p = await rating.methods.getProduct(i).call({from: this.state.accounts[0]});
      products.push(p);
    }
    this.setState({products});

    console.log('products', this.state.products);
  }

  addProduct = async (event) => {
    event.preventDefault();

    this.setState({status: 'Adding product...'});
    await rating.methods.addProduct(this.state.newProductName).send({from: this.state.accounts[0]});
    this.setState({status: 'Product added!'});
  }

  addReview = async (event) => {
    event.preventDefault();

    let productId = event.target.value;
    let productRating = window.prompt("Choose a rating between 0 and 5:");

    if(!isNaN(productRating) && Number.isInteger(+productRating) && productRating >= 0 && productRating <= 5) {
      this.setState({status: 'Adding review...'});
      await rating.methods.addReview(productId, productRating).send({from: this.state.accounts[0]});
      this.setState({status: 'Review added!'});
    } else
      this.setState({status: 'Invalid rating!'});
  }

  render() {
    return (
      <div>
        <div className="title">
          <h2>Rating Contract - </h2>
          <p className="owner">Owner: {this.state.owner}</p>
        </div>
        {this.state.owner === this.state.accounts[0] ?
          <form onSubmit={this.addProduct}>
            <p>
              <input placeholder="Type product name..." value={this.state.newProductName} onChange={event => {this.setState({newProductName: event.target.value})}}></input>
              <button>Add new product</button>
            </p>
          </form> : null
          }
        <p><b>Products:</b></p>
        <ul>
          {this.state.products.length ? null : <li>Loading...</li>}
          {this.state.products.map(p => 
            <li key={p.id}>
              {p.hasReviewed ? null : 
                <button value={p.id} onClick={this.addReview}>Review this product</button>
              }
              {(p.avgRating/10).toFixed(1)} - {p.title}
            </li>
          )}
        </ul>
        <h3>{this.state.status}</h3>
      </div>
    );
  }
}

export default App;