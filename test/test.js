const { assert } = require('chai')
const { default: Web3 } = require('web3')

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images', async()=> {
    let result,imageCount;
    const hash = '123';

    before(async() => {
      result = await decentragram.uploadImage(hash,'Hello',{from: author})
      imageCount = await decentragram.imageCount();
    })
    it('creates image', async()=>{
      assert.equal(imageCount,1)
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'id is correct');
      assert.equal(event.hash,hash,'hash is correct');
      assert.equal(event.description,'Hello','description is correct');
      assert.equal(event.tipAmount,'0','tip is correct');
      assert.equal(event.author,author,'author is correct');

      await decentragram.uploadImage('', 'description', {from: author}).should.be.rejected;
    })

    it('lists image', async() =>{
      const image = await decentragram.images(imageCount);
      assert.equal(image.id.toNumber(),imageCount.toNumber(),'id is correct');
      assert.equal(image.hash, hash,'hash is correct');
      assert.equal(image.description, 'Hello', 'description is correct');
      assert.equal(image.tipAmount,'0','tip is correct');
      assert.equal(image.author,author,'author is correct');
    })
    
    it('allows users to tip images', async() => {
      let oldAuthorBlance ;
      oldAuthorBlance = await web3.eth.getBalance(author);
      oldAuthorBlance = new web3.utils.toBN(oldAuthorBlance);

      result = await decentragram.tipImageOwner(imageCount, {from: tipper , value : web3.utils.toWei('1' , 'ether')});

      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(),imageCount.toNumber(),'id is correct');
      assert.equal(event.hash,hash,'hash is correct');
      assert.equal(event.description,"Hello",'description is correct');
      assert.equal(event.tipAmount,'1000000000000000000','tipamount is correct');
      assert.equal(event.author,author,'author is correct');

      let newAuthorBalance ;
      newAuthorBalance = await web3.eth.getBalance(author);
      newAuthorBalance = new web3.utils.BN(newAuthorBalance);

      let tipImageOwner;
      tipImageOwner = web3.utils.toWei('1','ether');
      tipImageOwner = new web3.utils.BN(tipImageOwner);

      const expectedBalanace = oldAuthorBlance.add(tipImageOwner);

      assert.equal(newAuthorBalance.toString(),expectedBalanace.toString());

      await decentragram.tipImageOwner(99,{from : tipper , value : web3.utils.toWei('2','ether')}).should.be.rejected;
      
    })


  })




})