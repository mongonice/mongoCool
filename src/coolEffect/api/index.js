import axios from 'axios';

export const getList = async _ => {
    return await axios.get(GET_LIST).then((data) => {
        return data
    }).catch(err => console.log(err))
}