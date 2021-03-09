import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

// 인스턴스 메서드를 작성할 때는
// this에 접근하기 위해 (this는 문서 인스턴스를 가르킨다.)
// 화삻표 함수가 아닌 function 키워드로 구현한다.
UserSchema.methods.setPassword = async function (password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function (password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true / false
};

// 스태틱 메서드에서 this는 모델을 카르킨다.
UserSchema.statics.findByUsername = function (username) {
  return this.findOne({ username });
};

// hashedPassword필드가 응답되지 않도록
UserSchema.methods.serialize = function () {
  const data = this.toJSON(); // JSON으로 변환한 후
  delete data.hashedPassword; // delete를 통해 지워준다.
  return data;
};

UserSchema.methods.generateToken = function () {
  const token = jwt.sign(
    // 첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣습니다.
    {
      _id: this.id,
      username: this.username,
    },
    // 두번째 파라미터에는 JWT 암호를 넣습니다.
    process.env.JWT_SECRET,
    {
      expiresIn: '7d', // 7일 동안 유효함
    }
  );
  return token;
};

const User = mongoose.model('User', UserSchema);

export default User;
