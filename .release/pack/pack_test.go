package pack

import (
	"bytes"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestEncryptDecrypt(t *testing.T) {

	SetCipher("0123456789123456")
	data := []byte("hello world")

	reader := bytes.NewReader(data)
	buffer := &bytes.Buffer{}
	err := Cipher.Encrypt(reader, buffer)
	if err != nil {
		t.Fatal(err)
	}
	encrypted := buffer.Bytes()

	buffer = &bytes.Buffer{}
	err = Cipher.Decrypt(bytes.NewReader(encrypted), buffer)
	if err != nil {
		t.Fatal(err)
	}
	decrypted := buffer.Bytes()
	assert.Equal(t, data, decrypted)
}
