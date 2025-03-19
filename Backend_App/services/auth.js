const User = require('../models/user');
const bcrypt = require('bcrypt');

const register = async (name, email, password, type = 'user') => {
    const existingUser = await User.findOne({email});
    if(existingUser){
        throw new Error('User already exists'); 
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password: hashedPassword, type});
    return user;
}

const login = async (email, password) => {
    const user = await User.findOne({email});
    if(!user){
        throw new Error('User not found');
    }
    const isPasswordValid =  bcrypt.compare(password, user.password);
    if(!isPasswordValid){
        throw new Error('Invalid credentials');
    }
    return user;
}
module.exports = {register, login};
