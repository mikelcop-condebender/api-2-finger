import { expect } from 'chai';
import Calculator from '../src/calculator';

describe('Test Calculator Class', ()=>{

    it('should return sum',()=>{
        // arrange 
        const calc = new Calculator();
        // act
        const result = calc.add(2,3);
        // assert
        expect(result).to.equal(5);
        
    });

    it('should return difference',()=>{
        // arrange
        const calc = new Calculator();
        // act
        const result = calc.subtract(2, 3);
        // assert
        expect(result).to.equal(-1);

    })


});