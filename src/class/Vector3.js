export default class Vector3 {
	x;
	y;
	z;

	constructor(x = 0, y = 0, z = 0) {
		if (typeof x === 'object') {
			this.x = x.x;
			this.y = x.y;
			this.z = x.z;
		} else {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	}

}
